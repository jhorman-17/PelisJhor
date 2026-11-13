import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, firstValueFrom } from "rxjs";
import { TMDB_API, TMDB_FONDO, TMDB_IMG, TMDB_REGION, TMDB_TOKEN } from "../config/tmdb.config";
import { Genero, PaginaPeliculas, Pelicula } from "../models/pelicula.model";
import { StorageService } from "./storage.service";

const CACHE_GENEROS = "pj_generos_tmdb";
const CACHE_DIAS = 7;
const MAX_PAGINAS = 500; // TMDB no deja pasar de la página 500

export const MENSAJE_SIN_CONEXION = "No se pudo conectar con TMDB. Revisa tu conexión a internet.";

type ParametrosTmdb = Record<string, string | number | boolean>;

// Película tal como la devuelve TMDB (en listas o en el detalle).
interface PeliculaTmdb {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  genres?: Genero[];
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  runtime?: number | null;
  credits?: { crew: { job: string; name: string }[]; cast: { name: string }[] };
}

interface RespuestaLista {
  results: PeliculaTmdb[];
  total_results: number;
  total_pages: number;
}

@Injectable({ providedIn: "root" })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly almacen = inject(StorageService);
  private readonly cache = new Map<string, Promise<unknown>>();
  private readonly nombresGenero = new Map<number, string>();
  private generosListos: Promise<void> | null = null;
  private readonly peticionesEnCurso = signal(0);
  private readonly peticionesEnCurso$ = toObservable(this.peticionesEnCurso);

  // Géneros en español, ordenados por nombre (para el filtro del catálogo).
  readonly generos = signal<Genero[]>([]);

  // Se resuelve cuando no queda ninguna petición pendiente (todas las secciones ya tienen datos).
  sinPeticionesPendientes(): Promise<number> {
    return firstValueFrom(this.peticionesEnCurso$.pipe(filter((n) => n === 0)));
  }

  cargarGeneros(): Promise<void> {
    this.generosListos ??= this.pedirGeneros().catch((err) => {
      console.error("TMDB: no se pudieron cargar los géneros", err);
      this.generosListos = null;
    });
    return this.generosListos;
  }

  // nombre: "now_playing", "popular", "top_rated" o "upcoming".
  async lista(nombre: string): Promise<Pelicula[]> {
    await this.cargarGeneros();
    const data = await this.get<RespuestaLista>(`/movie/${nombre}`, { region: TMDB_REGION });
    return data.results.map((m) => this.aPelicula(m));
  }

  // Con texto usa /search; sin texto, /discover con los filtros.
  async explorar(params: ParametrosTmdb, pagina: number): Promise<PaginaPeliculas> {
    await this.cargarGeneros();
    const ruta = params["query"] ? "/search/movie" : "/discover/movie";
    const data = await this.get<RespuestaLista>(ruta, { include_adult: false, ...params, page: pagina });
    return {
      peliculas: data.results.map((m) => this.aPelicula(m)),
      total: data.total_results,
      paginas: Math.min(data.total_pages, MAX_PAGINAS),
    };
  }

  async pelicula(id: number): Promise<Pelicula> {
    return this.aPelicula(await this.get<PeliculaTmdb>(`/movie/${id}`, { append_to_response: "credits" }));
  }

  // Si alguna falla, se omite y se devuelven las demás.
  async peliculas(ids: number[]): Promise<Pelicula[]> {
    const resultados = await Promise.allSettled(ids.map((id) => this.pelicula(id)));
    return resultados.filter((r) => r.status === "fulfilled").map((r) => r.value);
  }

  // Cada respuesta queda en memoria para no repetir la misma petición.
  private get<T>(ruta: string, params: ParametrosTmdb = {}): Promise<T> {
    const httpParams = new HttpParams({ fromObject: { language: "es-ES", ...params } });
    const clave = `${ruta}?${httpParams.toString()}`;
    if (!this.cache.has(clave)) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" });
      const promesa = firstValueFrom(this.http.get<T>(TMDB_API + ruta, { params: httpParams, headers }));
      this.peticionesEnCurso.update((n) => n + 1);
      const terminar = () => this.peticionesEnCurso.update((n) => n - 1);
      promesa.then(terminar, () => {
        terminar();
        this.cache.delete(clave);
      });
      this.cache.set(clave, promesa);
    }
    return this.cache.get(clave) as Promise<T>;
  }

  private async pedirGeneros(): Promise<void> {
    const guardado = this.almacen.leer<{ fecha: number; generos: Genero[] }>(CACHE_GENEROS);
    let lista = guardado && Array.isArray(guardado.generos) && Date.now() - guardado.fecha < CACHE_DIAS * 864e5 ? guardado.generos : null;
    if (!lista) {
      lista = (await this.get<{ genres: Genero[] }>("/genre/movie/list")).genres;
      this.almacen.guardar(CACHE_GENEROS, { fecha: Date.now(), generos: lista });
    }
    lista.forEach((g) => this.nombresGenero.set(g.id, g.name));
    this.generos.set([...lista].sort((a, b) => a.name.localeCompare(b.name, "es")));
  }

  private aPelicula(m: PeliculaTmdb): Pelicula {
    const directores = m.credits ? m.credits.crew.filter((c) => c.job === "Director").map((c) => c.name) : [];
    const actores = m.credits ? m.credits.cast.slice(0, 5).map((c) => c.name) : [];
    const minutos = m.runtime || 0;
    const h = Math.floor(minutos / 60), min = minutos % 60;
    return {
      id: m.id,
      titulo: m.title,
      anio: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
      fechaEstreno: m.release_date || null,
      poster: m.poster_path ? TMDB_IMG + m.poster_path : null,
      fondo: m.backdrop_path ? TMDB_FONDO + m.backdrop_path : null,
      generoIds: m.genres ? m.genres.map((g) => g.id) : m.genre_ids || [],
      generos: m.genres
        ? m.genres.map((g) => g.name)
        : (m.genre_ids || []).map((id) => this.nombresGenero.get(id)).filter((g): g is string => !!g),
      sinopsis: m.overview || null,
      voto: m.vote_count ? (m.vote_average ?? 0) / 2 : null, // TMDB califica de 0 a 10
      votos: m.vote_count || 0,
      popularidad: m.popularity || 0,
      duracion: minutos ? (h ? `${h} h ${min} min` : `${min} min`) : null,
      director: directores.length ? directores.join(" y ") : null,
      actores: actores.length ? actores : null,
    };
  }
}

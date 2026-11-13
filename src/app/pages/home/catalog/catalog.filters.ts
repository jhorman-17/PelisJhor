import { Params } from "@angular/router";

// Filtros del catálogo y su traducción a parámetros de la URL y de TMDB.

export type Orden = "popularidad" | "fecha" | "calificacion";

export interface Filtros {
  texto: string;
  genero: string; // id de género de TMDB, o "" para todos
  anio: string;
  min: number; // calificación mínima, de 0 a 5 estrellas
  orden: Orden;
  soloFav: boolean;
}

export const FILTROS_INICIALES: Filtros = { texto: "", genero: "", anio: "", min: 0, orden: "popularidad", soloFav: false };

export const OPCIONES_MIN = [
  { valor: 0, texto: "Cualquiera" },
  { valor: 1, texto: "1★ o más" },
  { valor: 2, texto: "2★ o más" },
  { valor: 3, texto: "3★ o más" },
  { valor: 4, texto: "4★ o más" },
  { valor: 5, texto: "5★" },
];

export const OPCIONES_ORDEN: { valor: Orden; texto: string }[] = [
  { valor: "popularidad", texto: "Popularidad" },
  { valor: "fecha", texto: "Fecha de estreno" },
  { valor: "calificacion", texto: "Calificación" },
];

// Parámetros de la URL: ?q=&genero=&anio=&min=&orden=&fav=1 (solo los que no tienen el valor inicial).
export function filtrosAParams(f: Filtros): Params {
  const params: Params = {};
  if (f.texto) params["q"] = f.texto;
  if (f.genero) params["genero"] = f.genero;
  if (f.anio) params["anio"] = f.anio;
  if (f.min > 0) params["min"] = String(f.min);
  if (f.orden !== FILTROS_INICIALES.orden) params["orden"] = f.orden;
  if (f.soloFav) params["fav"] = "1";
  return params;
}

// Parámetros de /discover o /search según los filtros elegidos.
export function filtrosATmdb(f: Filtros, hoy: string): Record<string, string | number> {
  if (f.texto) return f.anio ? { query: f.texto, primary_release_year: f.anio } : { query: f.texto };
  const p: Record<string, string | number> = {
    popularidad: { sort_by: "popularity.desc" },
    fecha: { sort_by: "primary_release_date.desc", "primary_release_date.lte": hoy, "vote_count.gte": 10 },
    calificacion: { sort_by: "vote_average.desc", "vote_count.gte": 300 },
  }[f.orden];
  if (f.genero) p["with_genres"] = f.genero;
  if (f.anio) p["primary_release_year"] = f.anio;
  if (f.min > 0) {
    p["vote_average.gte"] = f.min * 2;
    p["vote_count.gte"] = Math.max(Number(p["vote_count.gte"] ?? 0), 10);
  }
  return p;
}

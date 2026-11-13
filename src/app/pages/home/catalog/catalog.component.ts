import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from "@angular/router";
import { debounceTime, filter, firstValueFrom, skip } from "rxjs";
import { Pelicula } from "../../../core/models/pelicula.model";
import { SearchService } from "../../../core/services/search.service";
import { StorageService } from "../../../core/services/storage.service";
import { MENSAJE_SIN_CONEXION, TmdbService } from "../../../core/services/tmdb.service";
import { MovieGridComponent } from "../../../shared/movie-grid/movie-grid.component";
import { FILTROS_INICIALES, Filtros, OPCIONES_MIN, OPCIONES_ORDEN, Orden, filtrosAParams, filtrosATmdb } from "./catalog.filters";

interface EstadoCatalogo {
  lista: Pelicula[];
  total: number;
  pagina: number;
  paginas: number;
  cargando: boolean;
  error: boolean;
}

const HOY = new Date().toISOString().slice(0, 10);
const ANIO_MAX = new Date().getFullYear() + 1;
const ORDEN_LOCAL: Record<Orden, (a: Pelicula, b: Pelicula) => number> = {
  popularidad: (a, b) => b.popularidad - a.popularidad,
  fecha: (a, b) => claveFecha(b) - claveFecha(a),
  calificacion: (a, b) => (b.voto ?? -1) - (a.voto ?? -1),
};

function claveFecha(p: Pelicula): number {
  return p.fechaEstreno ? Date.parse(p.fechaEstreno) : 0;
}

// Quita tildes, mayúsculas y espacios de más para comparar textos.
function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Catálogo con búsqueda, filtros, orden y carga por páginas. Los filtros viven en la URL
// (?q=&genero=...): cada cambio navega con el Router y el catálogo se vuelve a pedir a TMDB.
@Component({
  selector: "app-catalog",
  imports: [MovieGridComponent],
  templateUrl: "./catalog.component.html",
  styleUrl: "./catalog.component.scss",
})
export class CatalogComponent {
  private readonly tmdb = inject(TmdbService);
  private readonly almacen = inject(StorageService);
  private readonly busqueda = inject(SearchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly opcionesMin = OPCIONES_MIN;
  protected readonly opcionesOrden = OPCIONES_ORDEN;
  protected readonly anios = Array.from({ length: ANIO_MAX - 1900 + 1 }, (_, i) => String(ANIO_MAX - i));
  protected readonly generos = computed(() => this.tmdb.generos().map((g) => ({ id: String(g.id), nombre: g.name })));

  protected readonly filtros = signal<Filtros>({ ...FILTROS_INICIALES });
  protected readonly catalogo = signal<EstadoCatalogo>({ lista: [], total: 0, pagina: 0, paginas: 0, cargando: false, error: false });
  private peticion = 0; // para descartar respuestas de búsquedas anteriores

  // Filtros que TMDB no aplica en la búsqueda por texto ni en favoritas, y se aplican aquí.
  private readonly hayFiltrosLocales = computed(() => {
    const f = this.filtros();
    return f.soloFav || (!!f.texto && (!!f.genero || f.min > 0));
  });

  protected readonly hayMas = computed(() => !this.filtros().soloFav && this.catalogo().pagina < this.catalogo().paginas);

  protected readonly contador = computed(() => {
    const { lista, total, cargando, error } = this.catalogo();
    if (error) return MENSAJE_SIN_CONEXION;
    if (cargando && !lista.length) return "Cargando películas…";
    if (this.hayFiltrosLocales()) return `${lista.length} películas`;
    return `${lista.length} de ${total.toLocaleString("es")} películas`;
  });

  constructor() {
    // Solo la primera URL, al abrir la página, puede hacer bajar al catálogo.
    let primeraUrl = !this.router.navigated;
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.aplicarUrl(params, primeraUrl);
      primeraUrl = false;
    });

    // El buscador de la barra espera 400 ms sin escribir antes de buscar.
    toObservable(this.busqueda.texto)
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe((texto) => {
        if (texto.trim() !== this.filtros().texto) this.cambiar("texto", texto.trim());
      });

    toObservable(this.almacen.favoritos)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => {
        if (this.filtros().soloFav) this.cargar();
      });
  }

  // Cambia un filtro actualizando la URL, sin mover la página ni añadir entradas al historial.
  protected cambiar<K extends keyof Filtros>(campo: K, valor: Filtros[K]): void {
    this.navegar({ ...this.filtros(), [campo]: valor });
  }

  protected cambiarOrden(valor: string): void {
    const orden = OPCIONES_ORDEN.find((o) => o.valor === valor)?.valor ?? FILTROS_INICIALES.orden;
    this.cambiar("orden", orden);
  }

  protected limpiar(): void {
    this.navegar(FILTROS_INICIALES);
  }

  protected async cargar(siguientePagina = false): Promise<void> {
    const yo = ++this.peticion;
    const f = this.filtros();
    const anterior = siguientePagina ? this.catalogo() : { lista: [], total: 0, pagina: 0, paginas: 0 };
    this.catalogo.set({ ...anterior, cargando: true, error: false });
    try {
      if (f.soloFav) {
        const lista = (await this.tmdb.peliculas(this.almacen.favoritos())).filter((p) => this.pasaFiltrosLocales(p, f));
        if (yo !== this.peticion) return;
        this.catalogo.set({ lista: lista.sort(ORDEN_LOCAL[f.orden]), total: lista.length, pagina: 0, paginas: 0, cargando: false, error: false });
      } else {
        const r = await this.tmdb.explorar(filtrosATmdb(f, HOY), anterior.pagina + 1);
        if (yo !== this.peticion) return;
        const yaListadas = new Set(anterior.lista.map((p) => p.id));
        let nuevas = r.peliculas.filter((p) => p.poster && !yaListadas.has(p.id));
        if (f.texto) nuevas = nuevas.filter((p) => this.pasaFiltrosLocales(p, f));
        const lista = [...anterior.lista, ...nuevas];
        if (f.texto && f.orden !== "popularidad") lista.sort(ORDEN_LOCAL[f.orden]);
        this.catalogo.set({ lista, total: r.total, pagina: anterior.pagina + 1, paginas: r.paginas, cargando: false, error: false });
      }
    } catch (err) {
      if (yo !== this.peticion) return;
      console.error("TMDB: error cargando el catálogo", err);
      this.catalogo.update((c) => ({ ...c, cargando: false, error: true }));
    }
  }

  private async aplicarUrl(params: ParamMap, primeraUrl: boolean): Promise<void> {
    await this.tmdb.cargarGeneros();
    const f = this.leerFiltros(params);
    const esperados = filtrosAParams(f);

    // Si la URL trae valores inválidos o sobrantes, se corrige y se espera la nueva URL.
    const urlCorrecta = params.keys.length === Object.keys(esperados).length && params.keys.every((k) => params.get(k) === esperados[k]);
    if (!urlCorrecta) {
      this.navegar(f);
      return;
    }

    this.filtros.set(f);
    if (this.busqueda.texto().trim() !== f.texto) this.busqueda.texto.set(f.texto);
    this.busqueda.guardarFiltros(esperados);
    const carga = this.cargar();

    // Si se abrió la página con filtros (por ejemplo, al recargar), se baja directo al catálogo
    // cuando todas las secciones ya cargaron, para que las de arriba no lo empujen después.
    if (primeraUrl && params.keys.length && !this.route.snapshot.fragment) {
      await carga;
      await this.tmdb.sinPeticionesPendientes();
      if (!this.router.navigated) await firstValueFrom(this.router.events.pipe(filter((e) => e instanceof NavigationEnd)));
      this.router.navigate([], { relativeTo: this.route, queryParamsHandling: "preserve", fragment: "catalogo", replaceUrl: true });
    }
  }

  private leerFiltros(params: ParamMap): Filtros {
    const genero = params.get("genero") ?? "";
    const anio = params.get("anio") ?? "";
    const min = Number(params.get("min"));
    const orden = params.get("orden") as Orden;
    return {
      texto: (params.get("q") ?? "").trim(),
      genero: this.generos().some((g) => g.id === genero) ? genero : "",
      anio: this.anios.includes(anio) ? anio : "",
      min: Number.isInteger(min) && min >= 0 && min <= 5 ? min : 0,
      orden: OPCIONES_ORDEN.some((o) => o.valor === orden) ? orden : FILTROS_INICIALES.orden,
      soloFav: params.get("fav") === "1",
    };
  }

  private pasaFiltrosLocales(p: Pelicula, f: Filtros): boolean {
    const q = normalizar(f.texto);
    if (f.soloFav && q && !normalizar(p.titulo).includes(q)) return false;
    if (f.genero && !p.generoIds.includes(Number(f.genero))) return false;
    if (f.anio && String(p.anio) !== f.anio) return false;
    if (f.min > 0 && !((p.voto ?? 0) >= f.min)) return false;
    return true;
  }

  private navegar(f: Filtros): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtrosAParams(f),
      replaceUrl: true,
      preserveFragment: true,
      scroll: "manual",
    });
  }
}

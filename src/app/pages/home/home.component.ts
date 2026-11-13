import { Component, computed, effect, inject, signal } from "@angular/core";
import { Pelicula } from "../../core/models/pelicula.model";
import { StorageService } from "../../core/services/storage.service";
import { MENSAJE_SIN_CONEXION, TmdbService } from "../../core/services/tmdb.service";
import { MovieGridComponent } from "../../shared/movie-grid/movie-grid.component";
import { CarouselComponent } from "./carousel/carousel.component";
import { CatalogComponent } from "./catalog/catalog.component";

// Página de inicio (ruta "/"): carrusel, en cartelera, catálogo, mejor calificadas y favoritas.
@Component({
  selector: "app-home",
  imports: [CarouselComponent, CatalogComponent, MovieGridComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  private readonly tmdb = inject(TmdbService);
  private readonly almacen = inject(StorageService);

  protected readonly sinConexion = MENSAJE_SIN_CONEXION;
  protected readonly cartelera = signal<Pelicula[]>([]);
  protected readonly errorCartelera = signal(false);

  // null hasta que llegan de TMDB.
  private readonly peliculasFavoritas = signal<Pelicula[] | null>(null);
  protected readonly mejorCalificadas = signal<Pelicula[] | null>(null);

  // Al quitar una favorita desaparece de inmediato, sin esperar a TMDB.
  protected readonly favoritas = computed(() => this.peliculasFavoritas()?.filter((p) => this.almacen.esFavorita(p.id)) ?? null);

  constructor() {
    this.tmdb
      .lista("now_playing")
      .then((lista) => this.cartelera.set(lista.filter((p) => p.poster).slice(0, 8)))
      .catch((err) => {
        console.error("TMDB: error cargando la cartelera", err);
        this.errorCartelera.set(true);
      });

    // Favoritas y mejor calificadas dependen de lo guardado en este navegador.
    // Si cambian otra vez antes de que responda TMDB, se ignora la respuesta anterior.
    let ultimaCarga = 0;
    effect(() => {
      const favoritos = this.almacen.favoritos();
      const conResenas = this.almacen.idsConResenas();
      const carga = ++ultimaCarga;
      Promise.all([this.tmdb.peliculas(favoritos), this.tmdb.peliculas(conResenas)]).then(([favs, resenadas]) => {
        if (carga !== ultimaCarga) return;
        this.peliculasFavoritas.set(favs);
        this.mejorCalificadas.set(resenadas.sort((a, b) => this.almacen.media(b.id)! - this.almacen.media(a.id)!).slice(0, 8));
      });
    });
  }
}

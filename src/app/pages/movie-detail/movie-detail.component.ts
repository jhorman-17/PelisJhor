import { DatePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, computed, effect, inject, input, signal, untracked } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { Pelicula } from "../../core/models/pelicula.model";
import { SearchService } from "../../core/services/search.service";
import { StorageService } from "../../core/services/storage.service";
import { TmdbService } from "../../core/services/tmdb.service";
import { PosterComponent } from "../../shared/poster/poster.component";
import { StarsComponent } from "../../shared/stars/stars.component";
import { ReviewsComponent } from "./reviews/reviews.component";

type EstadoFicha = "cargando" | "lista" | "no-encontrada" | "error";

// Ficha de una película (ruta "/pelicula/:id"). El :id llega como input gracias a
// withComponentInputBinding() en app.config.ts.
@Component({
  selector: "app-movie-detail",
  imports: [DatePipe, RouterLink, PosterComponent, StarsComponent, ReviewsComponent],
  templateUrl: "./movie-detail.component.html",
  styleUrl: "./movie-detail.component.scss",
})
export class MovieDetailComponent {
  private readonly tmdb = inject(TmdbService);
  private readonly titulo = inject(Title);
  protected readonly almacen = inject(StorageService);

  readonly id = input.required<string>();

  protected readonly ND = "No especificado";
  protected readonly filtrosCatalogo = inject(SearchService).ultimosFiltros();
  protected readonly estado = signal<EstadoFicha>("cargando");
  protected readonly pelicula = signal<Pelicula | null>(null);

  protected readonly favorita = computed(() => {
    const p = this.pelicula();
    return !!p && this.almacen.esFavorita(p.id);
  });
  protected readonly media = computed(() => {
    const p = this.pelicula();
    return p ? this.almacen.media(p.id) : null;
  });
  protected readonly numeroResenas = computed(() => {
    const p = this.pelicula();
    return p ? this.almacen.resenas(p.id).length : 0;
  });

  constructor() {
    this.titulo.setTitle("Película — PelisJhor");
    effect(() => {
      const id = this.id();
      untracked(() => this.cargar(id));
    });
  }

  protected votos(p: Pelicula): string {
    return p.votos.toLocaleString("es");
  }

  private async cargar(param: string): Promise<void> {
    const id = /^\d+$/.test(param) ? Number(param) : 0;
    if (!id) return this.noEncontrada();
    this.estado.set("cargando");
    try {
      const pelicula = await this.tmdb.pelicula(id);
      this.pelicula.set(pelicula);
      this.titulo.setTitle(`${pelicula.titulo} — PelisJhor`);
      this.estado.set("lista");
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) return this.noEncontrada();
      console.error("TMDB: error cargando la película", err);
      this.estado.set("error");
    }
  }

  private noEncontrada(): void {
    this.titulo.setTitle("Película no encontrada — PelisJhor");
    this.estado.set("no-encontrada");
  }
}

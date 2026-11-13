import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Pelicula } from "../../core/models/pelicula.model";
import { StorageService } from "../../core/services/storage.service";
import { PosterComponent } from "../poster/poster.component";

// Tarjeta de una película en las cuadrículas: póster con enlace a la ficha, corazón de favorita,
// título, año y calificación. El elemento <app-movie-card> es la columna de la cuadrícula.
@Component({
  selector: "app-movie-card",
  imports: [RouterLink, PosterComponent],
  templateUrl: "./movie-card.component.html",
  host: { class: "col" },
})
export class MovieCardComponent {
  private readonly almacen = inject(StorageService);

  readonly pelicula = input.required<Pelicula>();

  protected readonly favorita = computed(() => this.almacen.esFavorita(this.pelicula().id));
  protected readonly meta = computed(() => {
    const p = this.pelicula();
    return `${p.anio ?? "Año n/e"}${p.voto !== null ? ` · ★ ${p.voto.toFixed(1)}` : ""}`;
  });

  protected alternarFavorita(): void {
    this.almacen.alternarFavorita(this.pelicula().id);
  }
}

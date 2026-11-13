import { Component, input } from "@angular/core";
import { Pelicula } from "../../core/models/pelicula.model";
import { MovieCardComponent } from "../movie-card/movie-card.component";

// Cuadrícula de pósteres (3 columnas en móvil, 4 desde 576 px, 6 desde 768 px y 8 desde 1200 px).
// Se usa en En cartelera, Catálogo, Mejor calificadas y Favoritas.
@Component({
  selector: "app-movie-grid",
  imports: [MovieCardComponent],
  templateUrl: "./movie-grid.component.html",
  host: { class: "row row-cols-3 row-cols-sm-4 row-cols-md-6 row-cols-xl-8 g-2" },
})
export class MovieGridComponent {
  readonly peliculas = input.required<Pelicula[]>();
}

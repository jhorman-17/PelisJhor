import { Component, input, linkedSignal } from "@angular/core";
import { Pelicula } from "../../core/models/pelicula.model";

// Póster de una película. Si no tiene imagen o no carga, muestra un recuadro en su lugar.
@Component({
  selector: "app-poster",
  templateUrl: "./poster.component.html",
  styleUrl: "./poster.component.scss",
})
export class PosterComponent {
  readonly pelicula = input.required<Pick<Pelicula, "titulo" | "poster">>();
  // true para la imagen principal de la pantalla: se carga de inmediato en lugar de en diferido.
  readonly prioritaria = input(false);

  // Vuelve a false cada vez que cambia el póster.
  protected readonly falloCarga = linkedSignal(() => {
    this.pelicula().poster;
    return false;
  });
}

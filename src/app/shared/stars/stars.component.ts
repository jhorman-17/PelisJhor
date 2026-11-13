import { Component, computed, input } from "@angular/core";

// Calificación de 0 a 5 estrellas (contorno = vacía, sólida = marcada).
// El propio elemento <app-stars> es el contenedor .stars, así el padre puede ajustar su tamaño.
@Component({
  selector: "app-stars",
  templateUrl: "./stars.component.html",
  styleUrl: "./stars.component.scss",
  host: {
    class: "stars",
    role: "img",
    "[attr.aria-label]": "llenas() + ' de 5 estrellas'",
  },
})
export class StarsComponent {
  readonly valor = input.required<number>();

  protected readonly posiciones = [1, 2, 3, 4, 5];
  protected readonly llenas = computed(() => Math.round(this.valor()));
}

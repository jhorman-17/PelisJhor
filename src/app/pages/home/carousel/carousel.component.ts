import { Component, DestroyRef, ElementRef, afterRenderEffect, inject, signal, viewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { bootstrapJs } from "../../../core/bootstrap";
import { Pelicula } from "../../../core/models/pelicula.model";
import { StorageService } from "../../../core/services/storage.service";
import { MENSAJE_SIN_CONEXION, TmdbService } from "../../../core/services/tmdb.service";
import { PosterComponent } from "../../../shared/poster/poster.component";

// Películas del carrusel. El id es el número que aparece en la URL de la película en themoviedb.org.
const CARRUSEL_IDS = [
  313369,  // La La Land
  1368337, // La Odisea (The Odyssey)
  157336,  // Interstellar
  969681,  // Spider-Man: Brand New Day
  1241983, // Sueños de trenes (Train Dreams)
  238,     // El padrino
  838240,  // Robot Dreams
  1317288, // Marty Supreme
];

// Carrusel "Las más populares" (componente Carousel de Bootstrap).
@Component({
  selector: "app-carousel",
  imports: [RouterLink, PosterComponent],
  templateUrl: "./carousel.component.html",
  styleUrl: "./carousel.component.scss",
})
export class CarouselComponent {
  private readonly tmdb = inject(TmdbService);
  protected readonly almacen = inject(StorageService);
  private readonly carrusel = viewChild.required<ElementRef<HTMLElement>>("carrusel");

  // null mientras carga; lista vacía si TMDB no respondió.
  protected readonly peliculas = signal<Pelicula[] | null>(null);
  protected readonly sinConexion = MENSAJE_SIN_CONEXION;

  constructor() {
    this.tmdb.peliculas(CARRUSEL_IDS).then((lista) => this.peliculas.set(lista));

    // Cuando las diapositivas ya están en pantalla, Bootstrap toma el control del carrusel.
    // Cambia cada 3 s, salvo que el sistema pida reducir el movimiento.
    let iniciado = false;
    const destroyRef = inject(DestroyRef);
    afterRenderEffect(() => {
      if (iniciado || !this.peliculas()?.length) return;
      iniciado = true;
      const elemento = this.carrusel().nativeElement;
      const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const instancia = bootstrapJs()?.Carousel.getOrCreateInstance(elemento, {
        interval: 3000,
        pause: "hover",
        ride: sinMovimiento ? false : "carousel",
      });
      if (!instancia) return;
      // Al salir de la página se libera el carrusel. Si está a mitad de una transición, primero
      // se deja terminar: Bootstrap aún la necesita y fallaría con el carrusel ya liberado.
      destroyRef.onDestroy(() => {
        instancia.pause();
        if (elemento.querySelector(".carousel-item-next, .carousel-item-prev")) {
          elemento.addEventListener("slid.bs.carousel", () => instancia.dispose(), { once: true });
        } else {
          instancia.dispose();
        }
      });
    });
  }

  protected dosDigitos(n: number): string {
    return String(n).padStart(2, "0");
  }

  protected meta(p: Pelicula): string {
    return [p.anio, p.generos.slice(0, 3).join(" · "), p.voto !== null ? `★ ${p.voto.toFixed(1)}` : ""].filter(Boolean).join(" · ");
  }
}

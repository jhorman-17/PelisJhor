import { DatePipe } from "@angular/common";
import { Component, computed, inject, input, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { StorageService } from "../../../core/services/storage.service";
import { StarsComponent } from "../../../shared/stars/stars.component";

// Formulario para escribir una reseña con estrellas y lista de las reseñas de la película.
@Component({
  selector: "app-reviews",
  imports: [DatePipe, ReactiveFormsModule, StarsComponent],
  templateUrl: "./reviews.component.html",
  styleUrl: "./reviews.component.scss",
})
export class ReviewsComponent {
  private readonly almacen = inject(StorageService);

  readonly peliculaId = input.required<number>();

  protected readonly opcionesEstrellas = [1, 2, 3, 4, 5];
  protected readonly formulario = inject(NonNullableFormBuilder).group({
    autor: ["", Validators.required],
    texto: ["", Validators.required],
    estrellas: [0, Validators.min(1)],
  });
  protected readonly error = signal("");
  protected readonly resenas = computed(() => this.almacen.resenas(this.peliculaId()));

  protected elegirEstrellas(n: number): void {
    this.formulario.controls.estrellas.setValue(n);
  }

  protected publicar(): void {
    const autor = this.formulario.controls.autor.value.trim();
    const texto = this.formulario.controls.texto.value.trim();
    const estrellas = this.formulario.controls.estrellas.value;
    if (!autor || !texto || estrellas < 1) {
      this.error.set("Completa tu nombre, la reseña y elige de 1 a 5 estrellas.");
      return;
    }
    const guardada = this.almacen.agregarResena(this.peliculaId(), { autor, texto, estrellas, fecha: new Date().toISOString() });
    this.error.set(guardada ? "" : "No se pudo guardar: el almacenamiento del navegador no está disponible.");
    if (guardada) this.formulario.reset();
  }
}

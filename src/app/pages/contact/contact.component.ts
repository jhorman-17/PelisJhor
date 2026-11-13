import { Component, inject, signal } from "@angular/core";
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CONTACTO } from "./contact.config";

type Campo = "nombre" | "correo" | "asunto" | "mensaje";

// Correo con usuario, @, dominio y extensión (por ejemplo, nombre@dominio.com).
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Como `required`, pero también rechaza un campo que solo tiene espacios.
function obligatorio(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

// Página de contactos (ruta "/contactos"). El proyecto no tiene servidor, así que el formulario
// valida los datos y muestra una confirmación de demostración, sin enviar ni guardar el mensaje.
@Component({
  selector: "app-contact",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
})
export class ContactComponent {
  protected readonly contacto = CONTACTO;
  // "3144562476" → "314 456 2476"
  protected readonly telefonoLegible = CONTACTO.telefono?.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3") ?? "";

  protected readonly formulario = inject(NonNullableFormBuilder).group({
    nombre: ["", [obligatorio, Validators.maxLength(60)]],
    correo: ["", [obligatorio, Validators.pattern(PATRON_CORREO), Validators.maxLength(120)]],
    asunto: ["", [obligatorio, Validators.maxLength(100)]],
    mensaje: ["", [obligatorio, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  // Nombre de quien envió el último formulario válido (para el mensaje de confirmación).
  protected readonly confirmacion = signal<string | null>(null);
  protected readonly intentoEnviar = signal(false);

  protected tieneError(campo: Campo): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected mensajeError(campo: Campo): string {
    const errores = this.formulario.controls[campo].errors ?? {};
    if (errores["required"]) return "Este campo es obligatorio.";
    if (errores["pattern"]) return "Escribe un correo válido, por ejemplo nombre@dominio.com.";
    if (errores["minlength"]) return `Escribe al menos ${errores["minlength"].requiredLength} caracteres.`;
    if (errores["maxlength"]) return `Máximo ${errores["maxlength"].requiredLength} caracteres.`;
    return "";
  }

  protected enviar(): void {
    this.intentoEnviar.set(true);
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.confirmacion.set(null);
      return;
    }
    this.confirmacion.set(this.formulario.controls.nombre.value.trim());
    this.formulario.reset();
    this.intentoEnviar.set(false);
  }
}

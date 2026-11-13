import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

// Cualquier URL que no coincide con otra ruta (ruta "**").
@Component({
  selector: "app-not-found",
  imports: [RouterLink],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.scss",
})
export class NotFoundComponent {}

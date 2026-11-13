import { ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/navbar/navbar.component";

// Componente raíz: la barra de navegación y, debajo, la página de la ruta actual.
@Component({
  selector: "app-root",
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  constructor() {
    // Al bajar a una sección (#catalogo, #favoritas) deja 76 px arriba, como scroll-padding-top.
    inject(ViewportScroller).setOffset([0, 76]);
  }
}

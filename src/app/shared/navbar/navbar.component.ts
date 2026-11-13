import { Component, ElementRef, inject, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { filter } from "rxjs";
import { bootstrapJs } from "../../core/bootstrap";
import { SearchService } from "../../core/services/search.service";

// Barra de navegación común a todas las páginas: logo, enlaces y buscador.
@Component({
  selector: "app-navbar",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  private readonly router = inject(Router);
  protected readonly busqueda = inject(SearchService);
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>("menu");

  constructor() {
    // En móvil, el menú desplegado se cierra al cambiar de página.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => bootstrapJs()?.Collapse.getInstance(this.menu().nativeElement)?.hide());
  }

  protected escribir(evento: Event): void {
    this.busqueda.texto.set((evento.target as HTMLInputElement).value);
  }

  // Enter en el buscador: lleva al catálogo con el texto escrito (desde cualquier página).
  protected buscar(evento: Event): void {
    evento.preventDefault();
    const q = this.busqueda.texto().trim();
    const enInicio = this.router.url.split(/[?#]/)[0] === "/";
    this.router.navigate(["/"], {
      queryParams: { q: q || null },
      queryParamsHandling: enInicio ? "merge" : "replace",
      fragment: "catalogo",
    });
  }
}

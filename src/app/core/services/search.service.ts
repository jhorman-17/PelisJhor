import { Injectable, signal } from "@angular/core";
import { Params } from "@angular/router";

const CLAVE_FILTROS = "pj_filtros";

// Comparte el texto del buscador de la barra de navegación con el catálogo y recuerda
// los últimos filtros usados, para que «Volver al catálogo» regrese con ellos.
@Injectable({ providedIn: "root" })
export class SearchService {
  readonly texto = signal("");

  guardarFiltros(params: Params): void {
    try {
      sessionStorage.setItem(CLAVE_FILTROS, JSON.stringify(params));
    } catch {}
  }

  ultimosFiltros(): Params {
    try {
      const guardados = JSON.parse(sessionStorage.getItem(CLAVE_FILTROS) ?? "{}");
      return guardados && typeof guardados === "object" ? guardados : {};
    } catch {
      return {};
    }
  }
}

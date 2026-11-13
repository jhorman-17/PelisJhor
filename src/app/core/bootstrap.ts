// Bootstrap (JS) se carga desde su CDN en index.html, igual que en la versión anterior.
// Aquí se declaran solo las partes que usa la aplicación: el carrusel y el menú plegable.
interface InstanciaCarrusel {
  pause(): void;
  dispose(): void;
}

interface InstanciaColapsable {
  hide(): void;
}

interface BootstrapGlobal {
  Carousel: { getOrCreateInstance(elemento: Element, opciones?: object): InstanciaCarrusel };
  Collapse: { getInstance(elemento: Element): InstanciaColapsable | null };
}

export function bootstrapJs(): BootstrapGlobal | undefined {
  return (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap;
}

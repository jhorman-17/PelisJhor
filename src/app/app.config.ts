import { registerLocaleData } from "@angular/common";
import { provideHttpClient, withFetch } from "@angular/common/http";
import localeEs from "@angular/common/locales/es";
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from "@angular/router";
import { routes } from "./app.routes";

// Fechas en español con el DatePipe (por ejemplo, "27 de febrero de 2024").
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Los parámetros de la ruta (como :id) llegan a los componentes como inputs.
      withComponentInputBinding(),
      // Enlaces con #fragmento bajan a esa sección; al volver atrás se recupera la posición.
      withInMemoryScrolling({ anchorScrolling: "enabled", scrollPositionRestoration: "enabled" }),
    ),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: "es" },
  ],
};

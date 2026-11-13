import { Routes } from "@angular/router";
import { ContactComponent } from "./pages/contact/contact.component";
import { HomeComponent } from "./pages/home/home.component";
import { MovieDetailComponent } from "./pages/movie-detail/movie-detail.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";

// Cada URL muestra un componente dentro del <router-outlet> de app.component.html.
export const routes: Routes = [
  { path: "", component: HomeComponent, title: "PelisJhor — Explora, reseña y guarda películas" },
  { path: "pelicula/:id", component: MovieDetailComponent }, // el título lo pone la ficha
  { path: "contactos", component: ContactComponent, title: "Contactos — PelisJhor" },
  { path: "**", component: NotFoundComponent, title: "Página no encontrada — PelisJhor" },
];

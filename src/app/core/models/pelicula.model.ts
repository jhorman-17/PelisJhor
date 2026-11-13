// Película en el formato que usan los componentes (se arma a partir de la respuesta de TMDB).
export interface Pelicula {
  id: number;
  titulo: string;
  anio: number | null;
  fechaEstreno: string | null;
  poster: string | null;
  fondo: string | null;
  generoIds: number[];
  generos: string[];
  sinopsis: string | null;
  voto: number | null; // de 0 a 5 estrellas
  votos: number;
  popularidad: number;
  duracion: string | null;
  director: string | null;
  actores: string[] | null;
}

export interface Genero {
  id: number;
  name: string;
}

export interface Resena {
  autor: string;
  texto: string;
  estrellas: number;
  fecha: string;
}

// Página de resultados del catálogo o de una búsqueda.
export interface PaginaPeliculas {
  peliculas: Pelicula[];
  total: number;
  paginas: number;
}

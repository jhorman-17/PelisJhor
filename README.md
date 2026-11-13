# PelisJhor

Sitio web para explorar películas, escribir reseñas y guardar favoritas. Es un proyecto universitario inspirado en Letterboxd; no tiene relación con esa plataforma.

La aplicación está hecha con **Angular 21**. Las películas se obtienen de la API de [TMDB](https://www.themoviedb.org/), y las reseñas y favoritas se guardan en el navegador con `localStorage`.

## Video

Video de presentación del proyecto, parte de la actividad:

[![Video de presentación de PelisJhor](https://img.youtube.com/vi/Kl15I3j-47c/hqdefault.jpg)](https://youtu.be/Kl15I3j-47c)

Enlace: <https://youtu.be/Kl15I3j-47c>

## Tecnologías

- Angular 21 (componentes standalone, signals y Angular Router)
- TypeScript
- Sass (SCSS)
- Bootstrap 5.3.3 desde CDN (grilla, barra de navegación, formularios y carrusel)
- API de TMDB con `HttpClient`

## Cómo ejecutarlo

Requiere [Node.js](https://nodejs.org/) 20.19, 22.12 o 24 (o más reciente) y conexión a internet.

```
npm install      instala las dependencias (solo la primera vez)
npm start        inicia el servidor de desarrollo en http://localhost:4200
npm run build    genera la versión de producción en dist/pelisjhor
```

`npm start` ejecuta `ng serve`: la página se recarga sola al guardar cualquier archivo. En Visual Studio Code también se puede usar *Run and Debug → ng serve*.

## Rutas

Están en `src/app/app.routes.ts`. Cada URL muestra un componente dentro del `<router-outlet>` de `app.component.html`, y los enlaces usan `routerLink`, así que se cambia de página sin recargar.

| URL | Componente | Página |
|---|---|---|
| `/` | `HomeComponent` | Inicio: carrusel, en cartelera, catálogo, mejor calificadas y favoritas |
| `/pelicula/:id` | `MovieDetailComponent` | Ficha de una película con sus reseñas |
| `/contactos` | `ContactComponent` | Contactos y formulario |
| `**` (cualquier otra) | `NotFoundComponent` | Página no encontrada |

El catálogo guarda sus filtros en la URL (por ejemplo `/?genero=18&orden=calificacion`) y los enlaces "Películas" y "Favoritas" llevan a `/#catalogo` y `/#favoritas`.

## Estructura

```
PelisJhor/
├── angular.json, package.json, tsconfig*.json   Configuración de Angular y de TypeScript
└── src/
    ├── index.html              Página base: carga Bootstrap y las fuentes, y contiene <app-root>
    ├── main.ts                 Punto de entrada: arranca AppComponent
    ├── styles.scss             Estilos globales (importa los parciales de styles/)
    ├── styles/                 Variables Sass, tema, base, formularios, botones, pósteres y mixins
    └── app/
        ├── app.component.*     Componente raíz: <app-navbar> y <router-outlet>
        ├── app.config.ts       Router, HttpClient e idioma español
        ├── app.routes.ts       Rutas de la aplicación
        ├── core/               Lógica sin vista
        │   ├── config/         Token y direcciones de la API de TMDB
        │   ├── models/         Interfaces: Pelicula, Resena, Genero
        │   ├── services/       TmdbService, StorageService, SearchService
        │   └── bootstrap.ts    Acceso tipado al JavaScript de Bootstrap
        ├── shared/             Componentes reutilizables
        │   ├── navbar/         Barra de navegación y buscador
        │   ├── movie-grid/     Cuadrícula de pósteres
        │   ├── movie-card/     Tarjeta de una película
        │   ├── poster/         Póster con aviso si la imagen no carga
        │   └── stars/          Calificación con estrellas
        └── pages/              Una carpeta por página
            ├── home/           HomeComponent, carousel/ y catalog/
            ├── movie-detail/   MovieDetailComponent y reviews/
            ├── contact/        ContactComponent y contact.config.ts
            └── not-found/      NotFoundComponent
```

Cada componente tiene su lógica en `.ts`, su plantilla en `.html` y sus estilos en `.scss`. Los estilos que comparten varios componentes (tarjetas, pósteres, botones, formularios) están en `src/styles/`.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `AppComponent` | Estructura común: barra de navegación y página actual |
| `NavbarComponent` | Logo, enlaces (`routerLink`) y buscador; cierra el menú móvil al cambiar de página |
| `HomeComponent` | Página de inicio; carga En cartelera, Mejor calificadas y Favoritas |
| `CarouselComponent` | Carrusel "Las más populares" (Carousel de Bootstrap) |
| `CatalogComponent` | Búsqueda, filtros, orden, contador y "Cargar más películas" |
| `MovieGridComponent` | Cuadrícula responsive de tarjetas |
| `MovieCardComponent` | Póster, corazón de favorita, título, año y calificación |
| `PosterComponent` | Imagen del póster, o recuadro si no hay imagen o no carga |
| `StarsComponent` | Estrellas de 0 a 5 |
| `MovieDetailComponent` | Ficha de la película (recibe el `:id` de la ruta como `input`) |
| `ReviewsComponent` | Formulario de reseña con estrellas y lista de reseñas |
| `ContactComponent` | Información de contacto y formulario con validaciones |
| `NotFoundComponent` | Mensaje para rutas que no existen |

Los servicios de `core/services/` reúnen la lógica que antes estaba en los archivos JavaScript:

- **`TmdbService`**: peticiones a TMDB con `HttpClient`. Guarda cada respuesta en memoria para no repetirla.
- **`StorageService`**: favoritas y reseñas en `localStorage`, expuestas como *signals*. Por eso, al marcar una favorita se actualizan solas todas las secciones que la muestran.
- **`SearchService`**: comparte el texto del buscador con el catálogo y recuerda los últimos filtros para "Volver al catálogo".

## Sintaxis de Angular usada en las plantillas

- **Interpolación:** `{{ p.titulo }}`, `{{ contador() }}`.
- **Enlace de propiedades y atributos:** `[src]`, `[class.active]`, `[attr.aria-pressed]`, `[disabled]`.
- **Eventos:** `(click)`, `(change)`, `(input)`, `(ngSubmit)`, `(error)` en las imágenes.
- **Control de flujo:** `@if`, `@else`, `@for` con `track`, `@empty`, `@switch` y `@let`.
- **Directivas del Router:** `routerLink`, `routerLinkActive`, `<router-outlet>`.
- **Formularios reactivos:** `[formGroup]` y `formControlName` en reseñas y contacto.
- **Pipes:** `date` (fechas en español, por ejemplo "27 de febrero de 2024").
- **Proyección de contenido:** `<ng-content>` en `MovieGridComponent`.

## Página de contactos

Incluye un encabezado, una presentación, la información de contacto (correo, teléfono, Instagram, GitHub, repositorio, video y fuente de los datos) y un formulario con nombre, correo, asunto y mensaje. Cada campo es obligatorio, el correo debe tener un formato válido y el mensaje al menos 10 caracteres. Los errores se muestran debajo de cada campo.

El proyecto no tiene servidor, así que **el formulario no envía mensajes**: valida los datos y muestra una confirmación de demostración que lo indica.

Los datos de contacto están en `src/app/pages/contact/contact.config.ts`: al cambiarlos ahí se actualiza la página.

## Sass

Los estilos se escriben en SCSS y Angular los compila al ejecutar `npm start` o `npm run build`. Cada componente importa las variables con `@use "variables" as *;`.

### Variables

Están en `src/styles/_variables.scss`: colores (`$fondo`, `$acento`, `$favorita`…), fuentes (`$fuente-ui`, `$fuente-editorial`), bordes y transiciones (`$radio`, `$radio-lg`, `$transicion`) y puntos de quiebre (`$bp-sm`, `$bp-md`, `$bp-lg`, `$bp-xl`). Por ejemplo, en `navbar.component.scss`:

```scss
.pj-nav { background: rgba($fondo, .86); }
@media (max-width: $bp-md - .02px) { ... }   // 767.98px
```

### Anidación

Las reglas de cada elemento van agrupadas, y `&` se usa para estados y pseudoelementos:

```scss
.pj-logo {
  display: inline-flex;
  &::before { ... }          // .pj-logo::before
  &:hover, &:focus { ... }   // .pj-logo:hover, .pj-logo:focus
}
```

También están anidados `.pj-nav`, `.poster-card`, `.star-input`, `.carrusel` y `#detalle`, incluidos sus `@media`.

### Interpolación

1. En las variables CSS (`src/styles/_tema.scss`). Sass no evalúa el valor de una propiedad personalizada, así que la variable se inserta con `#{}`:
   ```scss
   --pj-accent: #{$acento};   // --pj-accent: #f2b441;
   ```
2. En el nombre de una clase (`src/styles/_peliculas.scss`). Bootstrap solo trae `row-cols` hasta 6, y la clase para 8 columnas se genera así:
   ```scss
   .row-cols-xl-#{$columnas-xl} > * { width: math.div(100%, $columnas-xl); }
   // con $columnas-xl: 8 → .row-cols-xl-8 > * { width: 12.5%; }
   ```

Además hay una función propia, `canales-rgb()`, y dos mixins (`titulo-pagina` y `lista-datos`) que comparten la ficha y la página de contactos.

## Funcionalidades

- **Inicio:** carrusel con películas elegidas (`CARRUSEL_IDS` en `carousel.component.ts`), películas en cartelera en Colombia, catálogo, mejor calificadas y favoritas.
- **Catálogo:** búsqueda por título y filtros por género, año, calificación mínima y orden. Las películas se cargan por páginas con el botón "Cargar más películas".
- **Ficha:** sinopsis, estreno, duración, director, géneros, actores y calificación de TMDB.
- **Reseñas:** nombre, texto y de 1 a 5 estrellas. La sección "Mejor calificadas" usa el promedio de estas reseñas.
- **Favoritas:** botón ♥ en cada póster, en el carrusel y en la ficha.

### Peticiones a TMDB

| Sección | Endpoint |
|---|---|
| Carrusel y ficha | `/movie/{id}` |
| En cartelera | `/movie/now_playing` |
| Catálogo con filtros | `/discover/movie` |
| Búsqueda | `/search/movie` |
| Géneros | `/genre/movie/list` (se guarda 7 días en `localStorage`) |

## Créditos

Datos e imágenes de [TMDB](https://www.themoviedb.org/), con fines académicos. Este proyecto usa la API de TMDB, pero no está respaldado ni certificado por TMDB.

## Limitaciones

- Sin internet no se muestran películas.
- TMDB solo permite recorrer 500 páginas de resultados por búsqueda.
- Algunas películas no tienen sinopsis en español.
- Las reseñas y favoritas solo existen en el navegador donde se crearon.
- El formulario de contacto no envía mensajes porque no hay servidor.

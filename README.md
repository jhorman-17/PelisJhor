# PelisJhor

Sitio web para explorar películas, escribir reseñas y guardar favoritas. Es un proyecto universitario inspirado en Letterboxd; no tiene relación con esa plataforma.

Las películas se obtienen de la API de [TMDB](https://www.themoviedb.org/). Las reseñas y las favoritas se guardan en el navegador con `localStorage`.

## Tecnologías

- HTML5
- Sass (SCSS), compilado a CSS
- Bootstrap 5.3.3 desde CDN (grilla, barra de navegación, formularios y carrusel)
- JavaScript sin frameworks
- API de TMDB con `fetch`

## Estructura

```
PelisJhor/
├── index.html         Página de inicio
├── pelicula.html      Ficha de una película (pelicula.html?id=...)
├── scss/styles.scss   Estilos en Sass (este es el archivo que se edita)
├── css/styles.css     CSS compilado desde scss/styles.scss
├── js/utilidades.js   Funciones compartidas: localStorage, tarjetas, favoritas
├── js/config.js       Token de la API de TMDB
├── js/tmdb.js         Peticiones a TMDB
├── js/app.js          Lógica de la página de inicio
├── js/detalle.js      Lógica de la ficha y las reseñas
└── package.json       Compilador de Sass
```

Los scripts se cargan en este orden: `utilidades.js`, `config.js`, `tmdb.js` y luego `app.js` o `detalle.js`.

## Cómo ejecutarlo

1. Abrir la carpeta en Visual Studio Code.
2. Abrir `index.html` en el navegador, o usar la extensión Live Server (clic derecho en `index.html` → *Open with Live Server*).
3. Se necesita internet para cargar Bootstrap, las fuentes y las películas.

## Compilar los estilos con Sass

`css/styles.css` ya está compilado, así que la página funciona sin instalar nada. Solo hay que compilar al cambiar algo en `scss/styles.scss`:

```
npm install          (solo la primera vez, requiere Node.js)
npm run sass         compila una vez
npm run sass:watch   recompila cada vez que se guarda el archivo
```

`css/styles.css` no se edita a mano porque se sobrescribe al compilar.

### Variables

Están al inicio de `scss/styles.scss`: colores (`$fondo`, `$acento`, `$favorita`…), fuentes (`$fuente-ui`, `$fuente-editorial`), bordes y transiciones (`$radio`, `$radio-lg`, `$transicion`) y puntos de quiebre (`$bp-sm`, `$bp-md`, `$bp-lg`, `$bp-xl`). Por ejemplo:

```scss
$acento: #f2b441;
.pj-nav { background: rgba($fondo, .86); }
@media (max-width: $bp-md - .02px) { ... }   // 767.98px
```

### Anidación

Cada componente agrupa sus reglas, y `&` se usa para estados y pseudoelementos:

```scss
.pj-logo {
  display: inline-flex;
  &::before { ... }          // .pj-logo::before
  &:hover, &:focus { ... }   // .pj-logo:hover, .pj-logo:focus
}
```

También están anidados `.pj-nav`, `.poster-card`, `.star-input`, `.carrusel` y `#detalle`, incluidos sus `@media`.

### Interpolación

1. En las variables CSS. Sass no evalúa el valor de una propiedad personalizada, así que la variable se inserta con `#{}`:
   ```scss
   --pj-accent: #{$acento};   // --pj-accent: #f2b441;
   ```
2. En el nombre de una clase. Bootstrap solo trae `row-cols` hasta 6, y la clase para 8 columnas se genera así:
   ```scss
   .row-cols-xl-#{$columnas-xl} > * { width: math.div(100%, $columnas-xl); }
   // con $columnas-xl: 8 → .row-cols-xl-8 > * { width: 12.5%; }
   ```

Además hay una función propia, `canales-rgb()`, que convierte un color al formato `r, g, b` que usan algunas variables de Bootstrap.

## Funcionalidades

- **Inicio:** carrusel con películas elegidas (`CARRUSEL_IDS` en `app.js`), películas en cartelera en Colombia, catálogo, mejor calificadas y favoritas.
- **Catálogo:** búsqueda por título y filtros por género, año, calificación mínima y orden. Las películas se cargan por páginas con el botón "Cargar más películas". Los filtros quedan en la URL, por ejemplo `index.html?genero=18&orden=calificacion`.
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

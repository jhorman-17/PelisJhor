# MyLetterboxd

Sitio de reseñas cinematográficas (proyecto universitario) inspirado en la experiencia de catálogo de Letterboxd. Proyecto educativo independiente, sin afiliación con ninguna plataforma.

Permite explorar todo el catálogo de películas de [TMDB](https://www.themoviedb.org/), buscar, filtrar y ordenar, ver la ficha de cada película, escribir reseñas con estrellas y guardar favoritas. Reseñas y favoritas se guardan solo en el navegador (`localStorage`).

## Tecnologías
HTML5 semántico, CSS3 (variables `--ml-*` en `:root`), Bootstrap 5.3.3 (CDN: grilla, navbar y formularios), JavaScript puro con scripts clásicos (sin módulos, sin servidor) y la API de TMDB (`fetch`).

## Estructura
```
MyLetterboxd/
├── index.html        Inicio: destacada, carrusel de populares, en cartelera, catálogo, mejor calificadas y favoritas
├── pelicula.html     Plantilla única de detalle (?id=...) con reseñas
├── css/styles.css    Estilos propios (identidad "Sala oscura")
├── js/peliculas.js   Utilidades compartidas (Almacen, tarjetas, favoritas)
├── js/config.js      Token de lectura de la API de TMDB
├── js/tmdb.js        Conexión con TMDB: catálogo, búsqueda, géneros y fichas
├── js/app.js         Inicio: búsqueda, filtros, orden y secciones
├── js/detalle.js     Ficha individual, reseñas y película no encontrada
└── README.md
```
El orden de carga importa: `peliculas.js`, `config.js` y `tmdb.js` siempre antes de `app.js` o `detalle.js`.

## Ejecutar en Visual Studio Code
1. Abre la carpeta `MyLetterboxd` en VS Code.
2. Opción simple: doble clic en `index.html`. Opción recomendada: extensión **Live Server**, clic derecho en `index.html` → *Open with Live Server*.
3. Necesitas internet para cargar Bootstrap, las fuentes y las películas de TMDB.

## Películas desde TMDB
No hay una lista de películas en el proyecto: todo sale de la API de TMDB con el token de `js/config.js` (de solo lectura, en <https://www.themoviedb.org/settings/api>). `tmdb.js` pide los datos en español y los convierte al formato de la web (`desdeTMDB`):

| Sección | Petición a TMDB |
|---|---|
| Película destacada | `/trending/movie/week` (la primera) y su ficha completa |
| Carrusel «Las más populares» | `/movie/{id}` de cada película de `CARRUSEL_IDS` (en `app.js`) |
| En cartelera | `/movie/now_playing` (región Colombia) |
| Catálogo con filtros | `/discover/movie` |
| Búsqueda por texto | `/search/movie` |
| Ficha, favoritas y reseñadas | `/movie/{id}` con director y reparto |
| Lista de géneros | `/genre/movie/list` (se guarda 7 días en `localStorage`) |

El carrusel usa el componente Carousel de Bootstrap: imagen de fondo de la película, póster, sinopsis y botones; avanza solo cada 6 s (se pausa con el cursor encima y no se mueve solo si el sistema pide menos movimiento). Para cambiar sus películas, edita `CARRUSEL_IDS` con el número que aparece en la URL de cada película en themoviedb.org.

Cada película se identifica por su id de TMDB (`pelicula.html?id=693134`). Las respuestas se guardan en memoria mientras la página está abierta para no repetir peticiones. Las películas sin póster no se muestran en las listas.

## Búsqueda, filtros y orden
`app.js` mantiene un único objeto `estado` (texto, género, año, calificación mínima, orden y «solo favoritas»). Cada control lo modifica y vuelve a pedir el catálogo a TMDB, de 20 en 20 películas con el botón «Cargar más películas». La búsqueda espera a que se deje de escribir (400 ms) para no hacer una petición por tecla, y se ignoran las respuestas de búsquedas anteriores.

- Sin texto, género, año, calificación y orden los aplica TMDB (`/discover`). La calificación mínima usa la nota de TMDB pasada a 5 estrellas; el orden por calificación exige al menos 300 votos para evitar películas con un solo voto.
- Con texto, TMDB busca por título (y año); el género y la calificación se filtran sobre los resultados.
- «Solo favoritas» muestra tus favoritas con los mismos filtros.

Los filtros se reflejan en la URL (`index.html?genero=18&orden=calificacion`), así que se pueden compartir o recargar. «Volver al catálogo» en la ficha regresa con los últimos filtros usados. Los valores inválidos en la URL se ignoran.

## Reseñas y favoritas
- **Reseñas:** formulario en la ficha (nombre, texto y de 1 a 5 estrellas). La media de tus reseñas alimenta «Mejor calificadas». El texto se escapa antes de mostrarse (no se inyecta HTML).
- **Favoritas:** botón ♥ en cada póster, en la película destacada y en la ficha. Se listan en la sección «Favoritas» del inicio.
- Todo se guarda en `localStorage` con las claves `ml_resenas` y `ml_favoritos`, usando el id de TMDB; los datos se validan al leerlos. Las favoritas, reseñas y enlaces de la versión anterior (ids como `dune-part-two`) se convierten solos a ids de TMDB (`IDS_ANTIGUOS` en `peliculas.js`). Para borrarlos, limpia los datos del sitio en el navegador.

## Cómo carga el detalle
Cada tarjeta enlaza a `pelicula.html?id=693134`. `detalle.js` lee el parámetro con `URLSearchParams`, pide la ficha a TMDB y la pinta: estreno, duración, director, géneros, actores principales y calificación de TMDB. Si el id falta o TMDB no lo encuentra, muestra «Película no encontrada» con enlace al inicio; si no hay conexión, lo indica.

## Imágenes y créditos
Pósteres y datos de [TMDB](https://www.themoviedb.org/) (© de sus respectivos estudios, uso académico sin fines de lucro). Si un póster no carga, en su lugar aparece un recuadro «Imagen no encontrada» con la ruta que falló.

Este producto usa la API de TMDB, pero no está respaldado ni certificado por TMDB.

## Conceptos académicos aplicados
- **Modelo de caja:** `box-sizing: border-box` (Bootstrap), `padding` y `border` en tarjetas y controles, `aspect-ratio: 2 / 3` en los pósteres.
- **Selectores:** etiqueta (`a`, `h1`), clase (`.poster-title`), id (`#detalle`), atributo (`[data-bs-theme="dark"]`), estado (`:hover`, `:focus-visible`) y relacional (`:has()`).
- **DOM y CSSOM:** el navegador convierte el HTML en el DOM y el CSS en el CSSOM; combinados forman el árbol de renderizado. JavaScript modifica el DOM (`innerHTML`, `getElementById`, `classList`) y el navegador recalcula el resultado.
- **Asincronía y APIs:** `fetch`, `async`/`await` y `Promise.all` para pedir datos a TMDB sin bloquear la página.
- **Semántica:** `header`, `nav`, `main`, `section`, `article`, `footer`, `dl` para los datos de la ficha, encabezados jerárquicos y `label` para cada campo.
- **Bootstrap Grid:** `.row-cols-3 .row-cols-sm-4 .row-cols-md-6 .row-cols-xl-8` en los pósteres (3 columnas en móvil, 4 desde 576 px, 6 desde 768 px, 8 desde 1200 px; `row-cols-xl-8` se define en `styles.css` porque Bootstrap solo llega a 6).
- **Responsive:** breakpoints de Bootstrap, `clamp()` en los títulos y `@media` propios para la navegación y el póster del hero.
- **Accesibilidad:** `aria-pressed` en favoritas y estrellas, `aria-live` en el contador, foco visible y `prefers-reduced-motion`.

## Limitaciones
- Sin conexión a internet no se muestran películas.
- El catálogo de TMDB permite recorrer como máximo 500 páginas (10.000 películas) por búsqueda o filtro.
- Algunas películas no tienen sinopsis en español; su ficha muestra «No especificado».
- Los datos propios viven en un solo navegador: no hay cuentas ni servidor.

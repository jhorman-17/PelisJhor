# CineClub

Sitio de reseñas cinematográficas (proyecto universitario), inspirado en la experiencia de catálogo de Letterboxd pero con identidad propia. Proyecto educativo independiente, sin afiliación con ninguna plataforma.

## Tecnologías
HTML5 semántico, CSS3 (variables en `:root`), Bootstrap 5.3.3 (CDN, solo grilla y componentes básicos) y JavaScript puro con scripts clásicos (sin módulos, sin servidor).

## Estructura
```
MyLetterboxd/
├── index.html        Inicio + catálogo
├── pelicula.html     Plantilla única de detalle (?id=...)
├── css/styles.css    Estilos propios
├── js/peliculas.js   Datos centralizados + utilidades compartidas
├── js/app.js         Inicio, búsqueda, filtros, orden
├── js/detalle.js     Ficha individual y película no encontrada
└── README.md
```
Si tu carpeta ya tiene `script` y `css`, reemplaza su contenido o renombra según esta estructura. El orden de carga importa: `peliculas.js` siempre antes de `app.js` o `detalle.js`.

## Ejecutar en Visual Studio Code
1. Abre la carpeta `MyLetterboxd` en VS Code.
2. Opción simple: doble clic en `index.html`. Opción recomendada: extensión **Live Server**, clic derecho en `index.html` → *Open with Live Server*.
3. Necesitas internet para cargar Bootstrap y las fuentes desde su CDN.

## Añadir una película
Copia un objeto de `PELICULAS` en `js/peliculas.js`, cambia el `id` (único, sin espacios) y completa los campos. No hay que tocar HTML. Se ve en inicio, catálogo y detalle automáticamente.

## Búsqueda y filtros
`app.js` mantiene un único objeto `estado` (texto, género, año, orden). Cada control lo modifica y llama a `render()`, que filtra una copia del arreglo, la ordena y repinta. Por eso los controles se combinan y nunca alteran el catálogo original. La búsqueda ignora mayúsculas, tildes y espacios sobrantes. El estado se refleja en la URL (si el navegador lo permite) para poder volver al catálogo con los mismos filtros.

## Cómo carga el detalle
Cada tarjeta enlaza a `pelicula.html?id=metropolis`. `detalle.js` lee el parámetro con `URLSearchParams`, busca el registro y pinta la ficha. Si el id falta o no existe, muestra un estado vacío con enlace al catálogo.

## Imágenes y créditos
Los pósteres están en la carpeta `assets/` (aportados por el autor; © de sus respectivos estudios, uso académico sin fines de lucro; anota aquí la web de descarga). En `js/peliculas.js`, el campo `poster` es el nombre del archivo **sin extensión**; la extensión principal se define en `POSTER_EXT` (`.jpg`) y, si falla, el sitio prueba `.png`, `.jpeg` y `.webp`. Si ninguna carga, se muestra un póster tipográfico de reserva. El fondo de la ficha reutiliza el mismo póster. No hay imágenes remotas.

Catálogo actual: 19 películas. «November 1963» es un estreno previsto para el 20 de noviembre de 2026, por eso aparece «Sin calificar». Puntuaciones, popularidad y reseñas son de demostración.

## Conceptos académicos aplicados
- **Modelo de caja:** `box-sizing: border-box` global; `padding` y `border` en controles, `max-width` en el contenedor y `.poster`.
- **Selectores:** etiqueta (`img`, `a`), clase (`.tarjeta__titulo`), id puntual (`#detalle`), estado (`:hover`, `:focus-visible`).
- **DOM y CSSOM:** el navegador convierte el HTML en el DOM y el CSS en el CSSOM; combinados forman el árbol de renderizado. JavaScript modifica el DOM (`innerHTML`, `getElementById`) y el navegador recalcula el resultado.
- **Semántica:** `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, encabezados jerárquicos, `label` para cada campo.
- **Bootstrap Grid:** `.row` con `.col-6 .col-sm-4 .col-md-3 .col-lg-2` en los pósteres (2 columnas en móvil, 3 desde 576 px, 4 desde 768 px, 6 desde 992 px).
- **Responsive:** Bootstrap por breakpoints, `aspect-ratio` en pósteres y un `@media` propio para el hero.

## Limitaciones de esta versión
- Catálogo de 19 películas (falta identificar la número 20).
- No incluye la sección de Favoritas.
- No se ha probado en un navegador: la revisión fue de lectura de código. Prueba 375, 576, 768, 1024 y 1440 px con las herramientas de desarrollador.

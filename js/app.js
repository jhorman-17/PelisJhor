// Página de inicio: carrusel, cartelera, catálogo con filtros, mejor calificadas y favoritas.

const INICIAL = { texto: "", genero: "", anio: "", min: 0, orden: "popularidad", soloFav: false };
const estado = { ...INICIAL };
const HOY = new Date().toISOString().slice(0, 10);
const ERROR_TMDB = "No se pudo conectar con TMDB. Revisa tu conexión a internet.";

// Películas del carrusel. El id es el número que aparece en la URL de la película en themoviedb.org.
const CARRUSEL_IDS = [
  313369,  // La La Land
  1368337, // La Odisea (The Odyssey)
  157336,  // Interstellar
  969681,  // Spider-Man: Brand New Day
  1241983, // Sueños de trenes (Train Dreams)
  238,     // El padrino
  838240,  // Robot Dreams
  1317288  // Marty Supreme
];

const catalogo = { lista: [], total: 0, pagina: 0, paginas: 0, cargando: false, error: false };
const cartelera = { lista: [], error: false };
let favoritas = [], mejorCalificadas = [];
let peticion = 0; // para descartar respuestas de búsquedas anteriores

// Quita tildes, mayúsculas y espacios de más para comparar textos.
const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const conPoster = (p) => p.poster;

const claveFecha = (p) => (p.fechaEstreno ? Date.parse(p.fechaEstreno) : 0);
const ORDEN_LOCAL = {
  popularidad: (a, b) => b.popularidad - a.popularidad,
  fecha: (a, b) => claveFecha(b) - claveFecha(a),
  calificacion: (a, b) => (b.voto ?? -1) - (a.voto ?? -1)
};

// Parámetros de TMDB según los filtros elegidos.
function paramsTMDB() {
  const texto = estado.texto.trim();
  if (texto) return estado.anio ? { query: texto, primary_release_year: estado.anio } : { query: texto };
  const p = {
    popularidad: { sort_by: "popularity.desc" },
    fecha: { sort_by: "primary_release_date.desc", "primary_release_date.lte": HOY, "vote_count.gte": 10 },
    calificacion: { sort_by: "vote_average.desc", "vote_count.gte": 300 }
  }[estado.orden];
  if (estado.genero) p.with_genres = estado.genero;
  if (estado.anio) p.primary_release_year = estado.anio;
  if (estado.min > 0) Object.assign(p, { "vote_average.gte": estado.min * 2, "vote_count.gte": Math.max(p["vote_count.gte"] || 0, 10) });
  return p;
}

// Filtros que TMDB no aplica en la búsqueda por texto (ni en favoritas): se aplican aquí.
function pasaFiltrosLocales(p) {
  const q = normalizar(estado.texto);
  if (estado.soloFav && q && !normalizar(p.titulo).includes(q)) return false;
  if (estado.genero && !p.generoIds.includes(Number(estado.genero))) return false;
  if (estado.anio && String(p.anio) !== estado.anio) return false;
  if (estado.min > 0 && !((p.voto ?? 0) >= estado.min)) return false;
  return true;
}
const hayFiltrosLocales = () => estado.soloFav || (estado.texto.trim() && (estado.genero || estado.min > 0));

async function cargarCatalogo(siguientePagina = false) {
  const yo = ++peticion;
  if (!siguientePagina) Object.assign(catalogo, { lista: [], total: 0, pagina: 0, paginas: 0 });
  Object.assign(catalogo, { cargando: true, error: false });
  pintarCatalogo();
  try {
    if (estado.soloFav) {
      const lista = (await TMDB.peliculas(Almacen.favoritos())).filter(pasaFiltrosLocales);
      if (yo !== peticion) return;
      Object.assign(catalogo, { lista: lista.sort(ORDEN_LOCAL[estado.orden]), total: lista.length });
    } else {
      const r = await TMDB.explorar(paramsTMDB(), catalogo.pagina + 1);
      if (yo !== peticion) return;
      let nuevas = r.peliculas.filter(conPoster);
      if (estado.texto.trim()) nuevas = nuevas.filter(pasaFiltrosLocales);
      catalogo.lista.push(...nuevas);
      if (estado.texto.trim() && estado.orden !== "popularidad") catalogo.lista.sort(ORDEN_LOCAL[estado.orden]);
      Object.assign(catalogo, { total: r.total, pagina: catalogo.pagina + 1, paginas: r.paginas });
    }
  } catch (err) {
    if (yo !== peticion) return;
    catalogo.error = true;
    console.error("TMDB: error cargando el catálogo", err);
  }
  catalogo.cargando = false;
  pintarCatalogo();
}

function pintarLista(idContenedor, idVacio, lista) {
  $(idContenedor).innerHTML = lista.map(tarjetaHTML).join("");
  if (idVacio) $(idVacio).classList.toggle("d-none", lista.length > 0);
}

function pintarCatalogo() {
  const { lista, cargando, error } = catalogo;
  $("grid").innerHTML = lista.map(tarjetaHTML).join("");
  $("sin-resultados").classList.toggle("d-none", cargando || error || lista.length > 0);
  $("contador").textContent = error ? ERROR_TMDB
    : cargando && !lista.length ? "Cargando películas…"
    : hayFiltrosLocales() ? `${lista.length} películas`
    : `${lista.length} de ${catalogo.total.toLocaleString("es")} películas`;
  const hayMas = !estado.soloFav && catalogo.pagina < catalogo.paginas;
  $("mas").classList.toggle("d-none", !hayMas || error);
  $("mas").disabled = cargando;
  $("mas").textContent = cargando ? "Cargando…" : "Cargar más películas";
}

function pintarCartelera() {
  if (cartelera.error) $("recientes").innerHTML = `<p class="pj-meta">${ERROR_TMDB}</p>`;
  else pintarLista("recientes", null, cartelera.lista);
}

async function cargarCartelera() {
  try {
    cartelera.lista = (await TMDB.lista("now_playing")).filter(conPoster).slice(0, 8);
  } catch (err) {
    cartelera.error = true;
    console.error("TMDB: error cargando la cartelera", err);
  }
  pintarCartelera();
}

function botonFavHTML(p) {
  const fav = Almacen.esFavorita(p.id);
  return `<button type="button" class="btn btn-pj-secondary${fav ? " active" : ""}" data-fav-id="${p.id}" aria-pressed="${fav}">${fav ? "♥ En favoritas" : "♡ Añadir a favoritas"}</button>`;
}

function diapositivaHTML(p, i, total) {
  const meta = [p.anio, p.generos.slice(0, 3).join(" · "), p.voto !== null ? `★ ${p.voto.toFixed(1)}` : ""].filter(Boolean).join(" · ");
  return `<div class="carousel-item${i === 0 ? " active" : ""}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${total}">
    <div class="carrusel-slide">
      ${p.fondo ? `<img class="carrusel-fondo" src="${esc(p.fondo)}" alt="" ${i === 0 ? "" : 'loading="lazy"'}>` : ""}
      <div class="carrusel-contenido">
        <a class="carrusel-poster d-none d-md-block" href="pelicula.html?id=${p.id}" tabindex="-1" aria-hidden="true">${posterHTML(p)}</a>
        <div class="carrusel-texto">
          <p class="carrusel-numero">${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</p>
          <h3>${esc(p.titulo)}</h3>
          <p class="pj-meta">${esc(meta)}</p>
          <p class="carrusel-sinopsis">${esc(p.sinopsis ?? "")}</p>
          <a class="btn btn-pj-primary me-2" href="pelicula.html?id=${p.id}">Ver detalle</a>
          ${botonFavHTML(p)}
        </div>
      </div>
    </div>
  </div>`;
}

async function cargarCarrusel() {
  const cont = $("carrusel");
  const peliculas = await TMDB.peliculas(CARRUSEL_IDS);
  if (!peliculas.length) {
    cont.innerHTML = `<p class="pj-meta p-4 mb-0">${ERROR_TMDB}</p>`;
    return;
  }
  const n = peliculas.length;
  cont.innerHTML = `<div class="carousel-indicators">
      ${peliculas.map((p, i) => `<button type="button" data-bs-target="#carrusel" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ""} aria-label="${esc(p.titulo)}"></button>`).join("")}
    </div>
    <div class="carousel-inner">${peliculas.map((p, i) => diapositivaHTML(p, i, n)).join("")}</div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carrusel" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Anterior</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carrusel" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Siguiente</span>
    </button>`;
  // Cambia cada 3 s, salvo que el sistema pida reducir el movimiento.
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  bootstrap.Carousel.getOrCreateInstance(cont, { interval: 3000, pause: "hover", ride: sinMovimiento ? false : "carousel" });
}

// Solo se actualizan los botones: repintar el carrusel lo regresaría a la primera diapositiva.
function marcarFavoritasCarrusel() {
  document.querySelectorAll("#carrusel .carrusel-texto [data-fav-id]").forEach((b) => {
    const fav = Almacen.esFavorita(Number(b.dataset.favId));
    b.classList.toggle("active", fav);
    b.setAttribute("aria-pressed", fav);
    b.textContent = fav ? "♥ En favoritas" : "♡ Añadir a favoritas";
  });
}

async function cargarSeccionesPropias() {
  [favoritas, mejorCalificadas] = await Promise.all([
    TMDB.peliculas(Almacen.favoritos()),
    TMDB.peliculas(Almacen.idsConResenas())
  ]);
  mejorCalificadas = mejorCalificadas.sort((a, b) => Almacen.media(b.id) - Almacen.media(a.id)).slice(0, 8);
  pintarSeccionesPropias();
}

function pintarSeccionesPropias() {
  pintarLista("destacadas", "sin-destacadas", mejorCalificadas);
  pintarLista("favoritas-grid", "sin-favoritas", favoritas.filter((p) => Almacen.esFavorita(p.id)));
}

function alCambiarFavorita() {
  pintarCartelera();
  marcarFavoritasCarrusel();
  pintarSeccionesPropias();
  if (estado.soloFav) cargarCatalogo();
  else pintarCatalogo();
  cargarSeccionesPropias();
}

// Los filtros quedan en la URL; pelicula.html los lee de sessionStorage para «Volver al catálogo».
function guardarEnURL() {
  const params = new URLSearchParams();
  if (estado.texto.trim()) params.set("q", estado.texto.trim());
  if (estado.genero) params.set("genero", estado.genero);
  if (estado.anio) params.set("anio", estado.anio);
  if (estado.min > 0) params.set("min", estado.min);
  if (estado.orden !== INICIAL.orden) params.set("orden", estado.orden);
  if (estado.soloFav) params.set("fav", "1");
  const query = params.toString();
  try { history.replaceState(null, "", `${location.pathname}${query ? "?" + query : ""}${location.hash}`); } catch {}
  try { sessionStorage.setItem("pj_filtros", query); } catch {}
}

function actualizarCatalogo() {
  guardarEnURL();
  cargarCatalogo();
}

// Pasa el estado a los controles y lo vuelve a leer, así un valor inválido de la URL queda en "Todos".
function sincronizarControles() {
  $("buscar").value = estado.texto;
  $("f-genero").value = estado.genero;
  $("f-anio").value = estado.anio;
  $("f-min").value = String(estado.min);
  $("f-orden").value = estado.orden;
  $("f-fav").checked = estado.soloFav;
  Object.assign(estado, {
    genero: $("f-genero").value,
    anio: $("f-anio").value,
    min: Number($("f-min").value) || 0,
    orden: $("f-orden").value || INICIAL.orden
  });
}

function iniciarControles() {
  const generos = [...GENEROS].sort((a, b) => a[1].localeCompare(b[1], "es"));
  const anioMax = new Date().getFullYear() + 1;
  const anios = Array.from({ length: anioMax - 1900 + 1 }, (_, i) => anioMax - i);
  $("f-genero").insertAdjacentHTML("beforeend", generos.map(([id, nombre]) => `<option value="${id}">${esc(nombre)}</option>`).join(""));
  $("f-anio").insertAdjacentHTML("beforeend", anios.map((a) => `<option>${a}</option>`).join(""));

  const url = new URLSearchParams(location.search);
  Object.assign(estado, {
    texto: url.get("q") ?? "",
    genero: url.get("genero") ?? "",
    anio: url.get("anio") ?? "",
    min: Number(url.get("min")) || 0,
    orden: url.get("orden") ?? INICIAL.orden,
    soloFav: url.get("fav") === "1"
  });
  sincronizarControles();
  // Si se llega con filtros (por ejemplo, buscando desde pelicula.html), se baja al catálogo.
  if ([...url.keys()].length && !location.hash) requestAnimationFrame(() => $("catalogo").scrollIntoView());

  // Espera 400 ms sin escribir antes de buscar, para no hacer una petición por tecla.
  let espera;
  $("buscar").addEventListener("input", (e) => {
    estado.texto = e.target.value;
    clearTimeout(espera);
    espera = setTimeout(actualizarCatalogo, 400);
  });
  $("form-buscar").addEventListener("submit", (e) => { e.preventDefault(); $("catalogo").scrollIntoView(); });
  $("f-genero").addEventListener("change", (e) => { estado.genero = e.target.value; actualizarCatalogo(); });
  $("f-anio").addEventListener("change", (e) => { estado.anio = e.target.value; actualizarCatalogo(); });
  $("f-min").addEventListener("change", (e) => { estado.min = Number(e.target.value); actualizarCatalogo(); });
  $("f-orden").addEventListener("change", (e) => { estado.orden = e.target.value; actualizarCatalogo(); });
  $("f-fav").addEventListener("change", (e) => { estado.soloFav = e.target.checked; actualizarCatalogo(); });
  $("mas").addEventListener("click", () => cargarCatalogo(true));
  $("limpiar").addEventListener("click", () => {
    Object.assign(estado, INICIAL);
    sincronizarControles();
    actualizarCatalogo();
  });
}

async function iniciar() {
  try { await TMDB.cargarGeneros(); } catch (err) { console.error("TMDB: no se pudieron cargar los géneros", err); }
  iniciarControles();
  activarFavoritos(alCambiarFavorita);
  cargarCarrusel();
  cargarCartelera();
  actualizarCatalogo();
  cargarSeccionesPropias();
}

iniciar();

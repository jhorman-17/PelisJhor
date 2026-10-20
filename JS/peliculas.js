/* ============================================================
   Catálogo + utilidades compartidas (se carga ANTES de app.js y detalle.js).
   ============================================================ */

// PENDIENTE DE CONFIRMAR: cambia aquí la extensión real de tus pósteres (.jpg, .png, .webp...).
// Si alguna imagen tiene otra extensión, pásala como segundo argumento: ruta("titanic_ver2", ".png")
const EXT_POSTER = ".jpg";
const ruta = (base, ext = EXT_POSTER) => `assets/${base}${ext}`;

// Datos no verificados se omiten (null / ausentes) y la web muestra "No especificado".
// "fechaEstreno" (AAAA-MM-DD) se deja en null: añádela solo si la conoces con certeza.
const PELICULAS = [
  { id: "avengers-endgame", titulo: "Avengers: Endgame", anio: 2019, fechaEstreno: null, generos: ["Acción", "Ciencia ficción", "Aventura"], director: "Anthony y Joe Russo", sinopsis: "Los Vengadores supervivientes intentan revertir las consecuencias de la acción de Thanos.", poster: ruta("avengers_endgame") },
  { id: "deadpool-and-wolverine", titulo: "Deadpool & Wolverine", anio: 2024, fechaEstreno: null, generos: ["Acción", "Comedia", "Ciencia ficción"], director: "Shawn Levy", sinopsis: "Deadpool y Wolverine se alían en una misión que cruza universos.", poster: ruta("deadpool_and_wolverine") },
  { id: "demon-slayer-infinity-castle", titulo: "Demon Slayer: Kimetsu no Yaiba – Infinity Castle", anio: 2025, fechaEstreno: null, generos: ["Animación", "Acción", "Fantasía"], director: "Haruo Sotozaki", sinopsis: "Los cazadores de demonios se adentran en la Fortaleza Infinita.", poster: ruta("demon_slayer__kimetsu_no_yaiba__infinity_castle") },
  { id: "dune-part-two", titulo: "Dune: Parte Dos", anio: 2024, fechaEstreno: null, generos: ["Ciencia ficción", "Aventura", "Drama"], director: "Denis Villeneuve", sinopsis: "Paul Atreides se une a los fremen en su guerra contra quienes destruyeron a su familia.", poster: ruta("dune_part_two") },
  { id: "f1", titulo: "F1", anio: 2025, fechaEstreno: null, generos: ["Drama", "Deportes", "Acción"], director: "Joseph Kosinski", sinopsis: "Un veterano piloto regresa a la Fórmula 1 para guiar a un joven talento.", poster: ruta("f_one_") },
  { id: "godfather-part-ii", titulo: "El padrino: Parte II", anio: 1974, fechaEstreno: null, generos: ["Crimen", "Drama"], director: "Francis Ford Coppola", sinopsis: "Michael Corleone consolida su poder mientras se narra el ascenso de Vito Corleone.", poster: ruta("godfather_part_ii") },
  { id: "godzilla-x-kong", titulo: "Godzilla x Kong: El nuevo imperio", anio: 2024, fechaEstreno: null, generos: ["Acción", "Ciencia ficción", "Aventura"], director: "Adam Wingard", sinopsis: "Godzilla y Kong deben unirse frente a una amenaza oculta en el mundo.", poster: ruta("godzilla_x_kong") },
  { id: "how-to-train-your-dragon", titulo: "Cómo entrenar a tu dragón", anio: 2025, fechaEstreno: null, generos: ["Fantasía", "Aventura", "Familiar"], director: "Dean DeBlois", sinopsis: "Un joven vikingo y un dragón desafían siglos de enemistad entre sus pueblos.", poster: ruta("how_to_train_your_dragon") },
  { id: "inside-out-2", titulo: "Intensamente 2", anio: 2024, fechaEstreno: null, generos: ["Animación", "Comedia", "Familiar"], director: "Kelsey Mann", sinopsis: "Riley entra en la adolescencia y llegan nuevas emociones a su mente.", poster: ruta("inside_out_two") },
  { id: "jurassic-world-dominion", titulo: "Jurassic World: Dominion", anio: 2022, fechaEstreno: null, generos: ["Aventura", "Ciencia ficción", "Acción"], director: "Colin Trevorrow", sinopsis: "Humanos y dinosaurios deben convivir en todo el planeta.", poster: ruta("jurassic_world_dominion_ver4_xlg") },
  { id: "lilo-and-stitch", titulo: "Lilo & Stitch", anio: 2025, fechaEstreno: null, generos: ["Familiar", "Comedia", "Ciencia ficción"], director: "Dean Fleischer Camp", sinopsis: "Una niña hawaiana adopta a un extraño alienígena como mascota.", poster: ruta("lilo_and_stitch") },
  { id: "minecraft-movie", titulo: "Una película de Minecraft", anio: 2025, fechaEstreno: null, generos: ["Aventura", "Comedia", "Fantasía"], director: "Jared Hess", sinopsis: "Un grupo de inadaptados es transportado al Mundo Principal, un reino cúbico.", poster: ruta("minecraft_the_movie_ver3") },
  { id: "ne-zha-2", titulo: "Ne Zha 2", anio: 2025, fechaEstreno: null, generos: ["Animación", "Fantasía", "Acción"], director: "Yang Yu (Jiaozi)", sinopsis: "Ne Zha y Ao Bing afrontan una nueva prueba tras su batalla contra el destino.", poster: ruta("nezha_mo_tong_nao_hai_ver3") },
  // Año y director sin verificar: se omiten a propósito.
  { id: "november-1963", titulo: "November 1963", anio: null, fechaEstreno: null, generos: [], director: null, sinopsis: null, poster: ruta("november_1963_ver2") },
  { id: "spider-man-no-way-home", titulo: "Spider-Man: No Way Home", anio: 2021, fechaEstreno: null, generos: ["Acción", "Aventura", "Ciencia ficción"], director: "Jon Watts", sinopsis: "Peter Parker pide ayuda al Doctor Strange y el multiverso se abre.", poster: ruta("spiderman_no_way_home_ver3") },
  { id: "star-wars-rise-of-skywalker", titulo: "Star Wars: El ascenso de Skywalker", anio: 2019, fechaEstreno: null, generos: ["Ciencia ficción", "Aventura", "Acción"], director: "J. J. Abrams", sinopsis: "La Resistencia y la Primera Orden se enfrentan en la batalla final.", poster: ruta("star_wars_the_rise_of_skywalker_ver4") },
  { id: "titanic", titulo: "Titanic", anio: 1997, fechaEstreno: null, generos: ["Drama", "Romance"], director: "James Cameron", sinopsis: "Un romance a bordo del trasatlántico que se hundió en 1912.", poster: ruta("titanic_ver2") },
  { id: "wicked-for-good", titulo: "Wicked: Por siempre", anio: 2025, fechaEstreno: null, generos: ["Musical", "Fantasía", "Drama"], director: "Jon M. Chu", sinopsis: "Elphaba y Glinda afrontan las consecuencias de sus decisiones en Oz.", poster: ruta("wicked_for_good_ver2") },
  { id: "zootopia-2", titulo: "Zootrópolis 2", anio: 2025, fechaEstreno: null, generos: ["Animación", "Comedia", "Familiar"], director: "Jared Bush y Byron Howard", sinopsis: "Judy Hopps y Nick Wilde investigan un nuevo caso en Zootrópolis.", poster: ruta("zootopia_two_ver2") }
];

/* ---------- Utilidades compartidas ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const buscarPelicula = (id) => PELICULAS.find((p) => p.id === id) || null;

/* ---------- localStorage (validado) ---------- */
const Almacen = {
  leer(clave) { try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; } },
  guardar(clave, valor) { try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch { return false; } },
  favoritos() {
    const v = this.leer("ml_favoritos");
    return Array.isArray(v) ? v.filter((id) => buscarPelicula(id)) : [];
  },
  esFavorita(id) { return this.favoritos().includes(id); },
  alternarFavorita(id) {
    const f = this.favoritos();
    const nueva = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    this.guardar("ml_favoritos", nueva);
    return nueva.includes(id);
  },
  _todasResenas() {
    const t = this.leer("ml_resenas");
    return t && typeof t === "object" && !Array.isArray(t) ? t : {};
  },
  resenas(id) {
    const l = this._todasResenas()[id];
    return Array.isArray(l) ? l.filter((r) => r && typeof r.autor === "string" && typeof r.texto === "string" && r.estrellas >= 1 && r.estrellas <= 5) : [];
  },
  agregarResena(id, resena) {
    const todas = this._todasResenas();
    todas[id] = [resena, ...this.resenas(id)];
    return this.guardar("ml_resenas", todas);
  },
  media(id) {
    const l = this.resenas(id);
    return l.length ? l.reduce((s, r) => s + r.estrellas, 0) / l.length : null;
  }
};

/* ---------- Componentes de interfaz ---------- */
function estrellasHTML(n) {
  const llenas = Math.round(n);
  let h = "";
  for (let i = 1; i <= 5; i++) h += `<span class="${i <= llenas ? "star-on" : "star-off"}">★</span>`;
  return `<span class="stars" role="img" aria-label="${llenas} de 5 estrellas">${h}</span>`;
}
function posterHTML(p) {
  return `<img class="poster-img" src="${esc(p.poster)}" alt="Póster de ${esc(p.titulo)}" loading="lazy" data-poster>`;
}
function tarjetaHTML(p) {
  const m = Almacen.media(p.id), fav = Almacen.esFavorita(p.id);
  return `<div class="col"><article class="poster-card">
    <div class="poster-wrap">
      <a href="pelicula.html?id=${encodeURIComponent(p.id)}" aria-label="Ver detalle de ${esc(p.titulo)}">${posterHTML(p)}</a>
      <button type="button" class="fav-btn${fav ? " active" : ""}" data-fav-id="${esc(p.id)}" aria-pressed="${fav}" aria-label="${fav ? "Quitar de" : "Añadir a"} favoritas: ${esc(p.titulo)}">♥</button>
    </div>
    <h3 class="poster-title">${esc(p.titulo)}</h3>
    <p class="poster-meta">${p.anio ?? "Año n/e"}${m !== null ? ` · ★ ${m.toFixed(1)}` : ""}</p>
  </article></div>`;
}

// Error de imagen: tratamiento discreto que identifica la ruta fallida (sin imagen genérica).
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-poster")) return;
  const d = document.createElement("div");
  d.className = "poster-img poster-error";
  d.setAttribute("role", "img");
  d.setAttribute("aria-label", img.alt);
  d.innerHTML = `<strong>Imagen no encontrada</strong><span>${esc(img.getAttribute("src"))}</span>`;
  img.replaceWith(d);
}, true);

// Favoritas: mismo comportamiento en ambas páginas. `despues` vuelve a pintar la vista.
function activarFavoritos(despues) {
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fav-id]");
    if (!b) return;
    Almacen.alternarFavorita(b.dataset.favId);
    despues();
  });
}
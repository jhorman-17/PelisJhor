/* ============================================================
   Utilidades compartidas (se carga ANTES de tmdb.js, app.js y detalle.js).
   Las películas ya no viven aquí: salen de la API de TMDB (ver tmdb.js).
   Cada película se identifica por su id numérico de TMDB.
   ============================================================ */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- localStorage (validado) ---------- */
const Almacen = {
  leer(clave) { try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; } },
  guardar(clave, valor) { try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch { return false; } },
  favoritos() {
    const v = this.leer("ml_favoritos");
    return Array.isArray(v) ? v.filter(Number.isInteger) : [];
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
  },
  idsConResenas() {
    return Object.keys(this._todasResenas()).map(Number).filter((id) => Number.isInteger(id) && this.resenas(id).length);
  }
};

/* ---------- Datos del catálogo local anterior ----------
   Antes las películas tenían ids de texto ("dune-part-two"). Se traducen a su id de TMDB
   para no perder favoritas, reseñas ni enlaces guardados. */
const IDS_ANTIGUOS = {
  "avengers-endgame": 299534, "deadpool-and-wolverine": 533535, "demon-slayer-infinity-castle": 1311031,
  "dune-part-two": 693134, "f1": 911430, "godfather-part-ii": 240, "godzilla-x-kong": 823464,
  "how-to-train-your-dragon": 1087192, "inside-out-2": 1022789, "jurassic-world-dominion": 507086,
  "lilo-and-stitch": 552524, "minecraft-movie": 950387, "ne-zha-2": 980477, "november-1963": 1287520,
  "spider-man-no-way-home": 634649, "star-wars-rise-of-skywalker": 181812, "superman": 1061474,
  "titanic": 597, "wicked-for-good": 967941, "zootopia-2": 1084242
};

(function migrarDatosAntiguos() {
  const favs = Almacen.leer("ml_favoritos");
  if (Array.isArray(favs) && favs.some((x) => typeof x === "string")) {
    const ids = favs.map((x) => (typeof x === "string" ? IDS_ANTIGUOS[x] : x)).filter(Number.isInteger);
    Almacen.guardar("ml_favoritos", [...new Set(ids)]);
  }
  const resenas = Almacen._todasResenas();
  if (Object.keys(resenas).some((k) => k in IDS_ANTIGUOS)) {
    const nuevas = {};
    for (const [k, lista] of Object.entries(resenas)) {
      const id = IDS_ANTIGUOS[k] ?? k;
      nuevas[id] = [...(nuevas[id] || []), ...(Array.isArray(lista) ? lista : [])];
    }
    Almacen.guardar("ml_resenas", nuevas);
  }
  try { localStorage.removeItem("ml_posters_tmdb"); } catch { /* caché de la versión anterior */ }
})();

/* ---------- Componentes de interfaz ---------- */
function estrellasHTML(n) {
  const llenas = Math.round(n);
  let h = "";
  for (let i = 1; i <= 5; i++) h += `<span class="${i <= llenas ? "star-on" : "star-off"}">★</span>`;
  return `<span class="stars" role="img" aria-label="${llenas} de 5 estrellas">${h}</span>`;
}
function posterHTML(p) {
  if (!p.poster) return `<div class="poster-img poster-error" role="img" aria-label="Póster de ${esc(p.titulo)}"><strong>Sin póster</strong></div>`;
  return `<img class="poster-img" src="${esc(p.poster)}" alt="Póster de ${esc(p.titulo)}" loading="lazy" data-poster>`;
}
function tarjetaHTML(p) {
  const fav = Almacen.esFavorita(p.id);
  return `<div class="col"><article class="poster-card">
    <div class="poster-wrap">
      <a href="pelicula.html?id=${p.id}" aria-label="Ver detalle de ${esc(p.titulo)}">${posterHTML(p)}</a>
      <button type="button" class="fav-btn${fav ? " active" : ""}" data-fav-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Quitar de" : "Añadir a"} favoritas: ${esc(p.titulo)}">♥</button>
    </div>
    <h3 class="poster-title">${esc(p.titulo)}</h3>
    <p class="poster-meta">${p.anio ?? "Año n/e"}${p.voto !== null ? ` · ★ ${p.voto.toFixed(1)}` : ""}</p>
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
    Almacen.alternarFavorita(Number(b.dataset.favId));
    despues();
  });
}

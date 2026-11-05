// Funciones compartidas por index.html y pelicula.html. Se carga antes que los demás scripts.

const $ = (id) => document.getElementById(id);

// Escapa el texto antes de insertarlo con innerHTML.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Favoritas y reseñas guardadas en localStorage, usando el id de TMDB de cada película.
const Almacen = {
  leer(clave) { try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; } },
  guardar(clave, valor) { try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch { return false; } },
  favoritos() {
    const v = this.leer("pj_favoritos");
    return Array.isArray(v) ? v.filter(Number.isInteger) : [];
  },
  esFavorita(id) { return this.favoritos().includes(id); },
  alternarFavorita(id) {
    const f = this.favoritos();
    const nueva = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    this.guardar("pj_favoritos", nueva);
    return nueva.includes(id);
  },
  _todasResenas() {
    const t = this.leer("pj_resenas");
    return t && typeof t === "object" && !Array.isArray(t) ? t : {};
  },
  resenas(id) {
    const l = this._todasResenas()[id];
    return Array.isArray(l) ? l.filter((r) => r && typeof r.autor === "string" && typeof r.texto === "string" && r.estrellas >= 1 && r.estrellas <= 5) : [];
  },
  agregarResena(id, resena) {
    const todas = this._todasResenas();
    todas[id] = [resena, ...this.resenas(id)];
    return this.guardar("pj_resenas", todas);
  },
  media(id) {
    const l = this.resenas(id);
    return l.length ? l.reduce((s, r) => s + r.estrellas, 0) / l.length : null;
  },
  idsConResenas() {
    return Object.keys(this._todasResenas()).map(Number).filter((id) => Number.isInteger(id) && this.resenas(id).length);
  }
};

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

// Si un póster no carga, se reemplaza por un recuadro con la ruta que falló.
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

// Un solo listener para todos los botones de favorita; `despues` vuelve a pintar la página.
function activarFavoritos(despues) {
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fav-id]");
    if (!b) return;
    Almacen.alternarFavorita(Number(b.dataset.favId));
    despues();
  });
}

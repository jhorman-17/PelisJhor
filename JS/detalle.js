/* Página de detalle. Requiere peliculas.js (catálogo, Almacen, utilidades). */
const cont = document.getElementById("detalle");
const id = new URLSearchParams(location.search).get("id");
const pelicula = id ? buscarPelicula(id) : null;
const ND = "No especificado";

function pintarResenas() {
  const lista = Almacen.resenas(pelicula.id);
  const m = Almacen.media(pelicula.id);
  document.getElementById("media").innerHTML = m !== null ? `${estrellasHTML(m)} <span class="ml-meta">${m.toFixed(1)} · ${lista.length} reseña(s)</span>` : `<span class="ml-meta">Sin calificaciones todavía</span>`;
  document.getElementById("lista-resenas").innerHTML = lista.length
    ? lista.map((r) => `<article class="ml-card mb-2"><span class="review-user">${esc(r.autor)}</span> ${estrellasHTML(r.estrellas)}
        <p class="review-text">${esc(r.texto)}</p>
        <p class="ml-meta mb-0">${esc(new Date(r.fecha).toLocaleDateString("es"))}</p></article>`).join("")
    : `<p class="ml-empty">Aún no hay reseñas. ¡Escribe la primera!</p>`;
}

function pintarFavorito() {
  const b = document.getElementById("btn-fav"), fav = Almacen.esFavorita(pelicula.id);
  b.dataset.favId = pelicula.id;
  b.classList.toggle("active", fav);
  b.setAttribute("aria-pressed", fav);
  b.textContent = fav ? "♥ En favoritas" : "♡ Añadir a favoritas";
}

function iniciarFormulario() {
  const form = document.getElementById("form-resena"), campoEstrellas = document.getElementById("r-estrellas");
  const botones = [...document.querySelectorAll("#star-input button")];
  const marcar = (n) => botones.forEach((b, i) => { b.classList.toggle("on", i < n); b.setAttribute("aria-pressed", i < n); });
  botones.forEach((b) => b.addEventListener("click", () => { campoEstrellas.value = b.dataset.valor; marcar(Number(b.dataset.valor)); }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const autor = document.getElementById("r-autor").value.trim();
    const texto = document.getElementById("r-texto").value.trim();
    const estrellas = Number(campoEstrellas.value);
    const error = document.getElementById("r-error");
    if (!autor || !texto || !(estrellas >= 1)) {
      error.textContent = "Completa tu nombre, la reseña y elige de 1 a 5 estrellas.";
      return;
    }
    const ok = Almacen.agregarResena(pelicula.id, { autor, texto, estrellas, fecha: new Date().toISOString() });
    error.textContent = ok ? "" : "No se pudo guardar: el almacenamiento del navegador no está disponible.";
    if (ok) { form.reset(); campoEstrellas.value = "0"; marcar(0); pintarResenas(); }
  });
}

if (!pelicula) {
  document.title = "Película no encontrada — MyLetterboxd";
  cont.innerHTML = `<div class="ml-empty"><h1 class="h4">Película no encontrada</h1>
    <p>No existe una película con el identificador solicitado.</p><a class="btn btn-acid" href="index.html">Volver al inicio</a></div>`;
} else {
  document.title = `${pelicula.titulo} — MyLetterboxd`;
  cont.innerHTML = `<article><div class="row g-4">
    <div class="col-6 col-sm-4 col-md-3 mx-auto mx-sm-0"><div class="poster-wrap">${posterHTML(pelicula)}</div></div>
    <div class="col-12 col-sm-8 col-md-9">
      <h1 class="h2 text-white">${esc(pelicula.titulo)} <small class="ml-meta">${pelicula.anio ?? ""}</small></h1>
      <div class="mb-3" id="media"></div>
      <p class="review-text">${esc(pelicula.sinopsis ?? "Sinopsis: " + ND)}</p>
      <dl class="detalle-datos row mt-3">
        <div class="col-6 col-md-4"><dt>Estreno</dt><dd>${esc(pelicula.fechaEstreno ?? ND)}</dd></div>
        <div class="col-6 col-md-4"><dt>Duración</dt><dd>${esc(pelicula.duracion ?? ND)}</dd></div>
        <div class="col-12 col-md-4"><dt>Director</dt><dd>${esc(pelicula.director ?? ND)}</dd></div>
        <div class="col-12 col-md-6"><dt>Géneros</dt><dd>${pelicula.generos.length ? pelicula.generos.map((g) => `<span class="badge-ml me-1">${esc(g)}</span>`).join("") : ND}</dd></div>
        <div class="col-12 col-md-6"><dt>Actores principales</dt><dd>${esc(pelicula.actores ? pelicula.actores.join(", ") : ND)}</dd></div>
      </dl>
      <button type="button" class="btn fav-btn fav-btn-lg" id="btn-fav"></button>
    </div></div></article>
    <section class="ml-section" aria-labelledby="t-res"><h2 class="ml-eyebrow" id="t-res">Reseñas</h2>
      <div class="row g-4">
        <div class="col-12 col-md-5">
          <form id="form-resena" class="ml-card" novalidate>
            <div class="mb-3"><label class="form-label ml-label" for="r-autor">Nombre o seudónimo</label>
              <input class="form-control" id="r-autor" maxlength="40" required></div>
            <div class="mb-3"><label class="form-label ml-label" for="r-texto">Tu reseña</label>
              <textarea class="form-control" id="r-texto" rows="4" maxlength="1000" required></textarea></div>
            <div class="mb-3"><span class="form-label ml-label d-block" id="l-estrellas">Calificación</span>
              <div class="star-input" id="star-input" role="group" aria-labelledby="l-estrellas">
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-valor="${n}" aria-label="${n} estrella(s)" aria-pressed="false">★</button>`).join("")}
              </div><input type="hidden" id="r-estrellas" value="0"></div>
            <p class="text-danger small" id="r-error" role="alert"></p>
            <button type="submit" class="btn btn-acid">Publicar reseña</button>
          </form>
        </div>
        <div class="col-12 col-md-7" id="lista-resenas"></div>
      </div></section>`;
  pintarFavorito();
  pintarResenas();
  iniciarFormulario();
  activarFavoritos(pintarFavorito);
}
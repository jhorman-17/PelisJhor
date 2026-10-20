/* Página inicial: catálogo, búsqueda, filtros, orden y favoritas. Requiere peliculas.js */
const $ = (id) => document.getElementById(id);
const estado = { texto: "", genero: "", anio: "", min: 0, orden: "fecha", soloFav: false };
const quitarTildes = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Clave de fecha: usa fechaEstreno si existe; si no, el año. Sin dato → 0 (queda al final).
const claveFecha = (p) => (p.fechaEstreno ? Date.parse(p.fechaEstreno) : p.anio ? Date.UTC(p.anio, 0, 1) : 0);

function filtrar() {
  const q = quitarTildes(estado.texto.trim());
  const favs = Almacen.favoritos();
  const lista = PELICULAS.filter((p) => {
    if (q && !quitarTildes(p.titulo).includes(q) && !p.generos.some((g) => quitarTildes(g).includes(q))) return false;
    if (estado.genero && !p.generos.includes(estado.genero)) return false;
    if (estado.anio && String(p.anio) !== estado.anio) return false;
    if (estado.min > 0 && !((Almacen.media(p.id) ?? 0) >= estado.min)) return false;
    if (estado.soloFav && !favs.includes(p.id)) return false;
    return true;
  });
  const orden = {
    fecha: (a, b) => claveFecha(b) - claveFecha(a),
    anio: (a, b) => (b.anio ?? 0) - (a.anio ?? 0),
    calificacion: (a, b) => (Almacen.media(b.id) ?? -1) - (Almacen.media(a.id) ?? -1)
  };
  return lista.sort(orden[estado.orden]);
}

function pintarLista(idContenedor, idVacio, lista) {
  $(idContenedor).innerHTML = lista.map(tarjetaHTML).join("");
  $(idVacio).classList.toggle("d-none", lista.length > 0);
}

function pintarDestacada() {
  const p = buscarPelicula("dune-part-two") || PELICULAS[0];
  const fav = Almacen.esFavorita(p.id);
  $("destacada").innerHTML = `<div class="row align-items-center g-4">
    <div class="col-6 col-sm-4 col-md-3 mx-auto mx-md-0"><div class="poster-wrap">${posterHTML(p)}</div></div>
    <div class="col-12 col-sm-8 col-md-9">
      <p class="ml-eyebrow border-0 mb-1">Película destacada</p>
      <h1 id="hero-titulo">${esc(p.titulo)}</h1>
      <p class="ml-meta">${p.anio ?? ""} · ${esc(p.generos.join(" · "))} · Dir. ${esc(p.director ?? "No especificado")}</p>
      <p class="sinopsis">${esc(p.sinopsis ?? "")}</p>
      <a class="btn btn-acid me-2" href="pelicula.html?id=${encodeURIComponent(p.id)}">Ver detalle</a>
      <button type="button" class="btn btn-ml-secondary${fav ? " active" : ""}" data-fav-id="${esc(p.id)}" aria-pressed="${fav}">${fav ? "♥ En favoritas" : "♡ Añadir a favoritas"}</button>
    </div></div>`;
}

function render() {
  const lista = filtrar();
  pintarDestacada();
  pintarLista("grid", "sin-resultados", lista);
  $("contador").textContent = `${lista.length} de ${PELICULAS.length} películas`;
  pintarLista("recientes", "sin-resultados-recientes" in window ? "" : "sin-favoritas",
    []); // placeholder neutralizado abajo
  $("sin-favoritas").classList.add("d-none");
  $("recientes").innerHTML = [...PELICULAS].sort((a, b) => claveFecha(b) - claveFecha(a)).slice(0, 8).map(tarjetaHTML).join("");
  const top = PELICULAS.filter((p) => Almacen.media(p.id) !== null).sort((a, b) => Almacen.media(b.id) - Almacen.media(a.id)).slice(0, 8);
  pintarLista("destacadas", "sin-destacadas", top);
  const favs = PELICULAS.filter((p) => Almacen.esFavorita(p.id));
  pintarLista("favoritas-grid", "sin-favoritas", favs);
  $("f-min").disabled = !PELICULAS.some((p) => Almacen.media(p.id) !== null);
  $("f-min").title = $("f-min").disabled ? "Disponible cuando existan reseñas con estrellas" : "";
}

function iniciarControles() {
  const generos = [...new Set(PELICULAS.flatMap((p) => p.generos))].sort();
  const anios = [...new Set(PELICULAS.map((p) => p.anio).filter(Boolean))].sort((a, b) => b - a);
  $("f-genero").insertAdjacentHTML("beforeend", generos.map((g) => `<option>${esc(g)}</option>`).join(""));
  $("f-anio").insertAdjacentHTML("beforeend", anios.map((a) => `<option>${a}</option>`).join(""));

  const q = new URLSearchParams(location.search).get("q");
  if (q) { estado.texto = q; $("buscar").value = q; }

  $("buscar").addEventListener("input", (e) => { estado.texto = e.target.value; render(); });
  $("form-buscar").addEventListener("submit", (e) => { e.preventDefault(); $("catalogo").scrollIntoView(); });
  $("f-genero").addEventListener("change", (e) => { estado.genero = e.target.value; render(); });
  $("f-anio").addEventListener("change", (e) => { estado.anio = e.target.value; render(); });
  $("f-min").addEventListener("change", (e) => { estado.min = Number(e.target.value); render(); });
  $("f-orden").addEventListener("change", (e) => { estado.orden = e.target.value; render(); });
  $("f-fav").addEventListener("change", (e) => { estado.soloFav = e.target.checked; render(); });
  $("limpiar").addEventListener("click", () => {
    Object.assign(estado, { texto: "", genero: "", anio: "", min: 0, orden: "fecha", soloFav: false });
    $("buscar").value = ""; $("f-genero").value = ""; $("f-anio").value = "";
    $("f-min").value = "0"; $("f-orden").value = "fecha"; $("f-fav").checked = false;
    render();
  });
}

iniciarControles();
activarFavoritos(render);
render();
// Peticiones a la API de TMDB. Necesita utilidades.js y config.js.

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_FONDO = "https://image.tmdb.org/t/p/w1280";
const TMDB_REGION = "CO";
const CACHE_GENEROS = "pj_generos_tmdb";
const CACHE_DIAS = 7;

// id de género → nombre en español (lo llena TMDB.cargarGeneros).
const GENEROS = new Map();

// Pasa una película de TMDB al formato que usan las páginas.
function desdeTMDB(m) {
  const directores = m.credits ? m.credits.crew.filter((c) => c.job === "Director").map((c) => c.name) : [];
  const actores = m.credits ? m.credits.cast.slice(0, 5).map((c) => c.name) : [];
  const h = Math.floor((m.runtime || 0) / 60), min = (m.runtime || 0) % 60;
  return {
    id: m.id,
    titulo: m.title,
    anio: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    fechaEstreno: m.release_date || null,
    poster: m.poster_path ? TMDB_IMG + m.poster_path : null,
    fondo: m.backdrop_path ? TMDB_FONDO + m.backdrop_path : null,
    generoIds: m.genres ? m.genres.map((g) => g.id) : m.genre_ids || [],
    generos: m.genres ? m.genres.map((g) => g.name) : (m.genre_ids || []).map((id) => GENEROS.get(id)).filter(Boolean),
    sinopsis: m.overview || null,
    voto: m.vote_count ? m.vote_average / 2 : null, // TMDB califica de 0 a 10; la web usa 5 estrellas
    votos: m.vote_count || 0,
    popularidad: m.popularity || 0,
    duracion: m.runtime ? (h ? `${h} h ${min} min` : `${min} min`) : null,
    director: directores.length ? directores.join(" y ") : null,
    actores: actores.length ? actores : null
  };
}

const TMDB = {
  _cache: new Map(),

  // Cada respuesta queda en memoria para no repetir la misma petición.
  get(ruta, params = {}) {
    if (typeof TMDB_TOKEN === "undefined" || !TMDB_TOKEN) return Promise.reject(new Error("Falta el token de TMDB en js/config.js"));
    const url = new URL(TMDB_API + ruta);
    url.search = new URLSearchParams({ language: "es-ES", ...params });
    const clave = url.toString();
    if (!this._cache.has(clave)) {
      const promesa = fetch(url, { headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" } }).then((res) => {
        if (!res.ok) throw Object.assign(new Error(`TMDB respondió ${res.status}`), { status: res.status });
        return res.json();
      });
      promesa.catch(() => this._cache.delete(clave));
      this._cache.set(clave, promesa);
    }
    return this._cache.get(clave);
  },

  async cargarGeneros() {
    const guardado = Almacen.leer(CACHE_GENEROS);
    let lista = guardado && Array.isArray(guardado.generos) && Date.now() - guardado.fecha < CACHE_DIAS * 864e5 ? guardado.generos : null;
    if (!lista) {
      lista = (await this.get("/genre/movie/list")).genres;
      Almacen.guardar(CACHE_GENEROS, { fecha: Date.now(), generos: lista });
    }
    lista.forEach((g) => GENEROS.set(g.id, g.name));
  },

  // nombre: "now_playing", "popular", "top_rated" o "upcoming".
  async lista(nombre) {
    const data = await this.get(`/movie/${nombre}`, { region: TMDB_REGION });
    return data.results.map(desdeTMDB);
  },

  // Con texto usa /search; sin texto, /discover con los filtros. TMDB no deja pasar de la página 500.
  async explorar(params, pagina) {
    const ruta = params.query ? "/search/movie" : "/discover/movie";
    const data = await this.get(ruta, { include_adult: false, ...params, page: pagina });
    return { peliculas: data.results.map(desdeTMDB), total: data.total_results, paginas: Math.min(data.total_pages, 500) };
  },

  async pelicula(id) {
    return desdeTMDB(await this.get(`/movie/${id}`, { append_to_response: "credits" }));
  },

  // Si alguna falla, se omite y se devuelven las demás.
  async peliculas(ids) {
    const r = await Promise.allSettled(ids.map((id) => this.pelicula(id)));
    return r.filter((x) => x.status === "fulfilled").map((x) => x.value);
  }
};

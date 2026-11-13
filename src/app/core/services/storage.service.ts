import { Injectable, signal } from "@angular/core";
import { Resena } from "../models/pelicula.model";

const CLAVE_FAVORITOS = "pj_favoritos";
const CLAVE_RESENAS = "pj_resenas";

// Favoritas y reseñas guardadas en localStorage, usando el id de TMDB de cada película.
// Se exponen como signals: al cambiar, se actualizan solas todas las vistas que las usan.
@Injectable({ providedIn: "root" })
export class StorageService {
  private readonly favoritosGuardados = signal<number[]>(this.leerFavoritos());
  private readonly resenasGuardadas = signal<Record<string, Resena[]>>(this.leerResenas());

  readonly favoritos = this.favoritosGuardados.asReadonly();

  leer<T>(clave: string): T | null {
    try {
      return JSON.parse(localStorage.getItem(clave) ?? "null") as T | null;
    } catch {
      return null;
    }
  }

  guardar(clave: string, valor: unknown): boolean {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  }

  esFavorita(id: number): boolean {
    return this.favoritosGuardados().includes(id);
  }

  alternarFavorita(id: number): void {
    const actuales = this.favoritosGuardados();
    const nuevas = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id];
    this.guardar(CLAVE_FAVORITOS, nuevas);
    this.favoritosGuardados.set(nuevas);
  }

  resenas(id: number): Resena[] {
    const lista = this.resenasGuardadas()[id];
    return Array.isArray(lista) ? lista.filter(esResenaValida) : [];
  }

  agregarResena(id: number, resena: Resena): boolean {
    const todas = { ...this.resenasGuardadas(), [id]: [resena, ...this.resenas(id)] };
    const guardada = this.guardar(CLAVE_RESENAS, todas);
    if (guardada) this.resenasGuardadas.set(todas);
    return guardada;
  }

  media(id: number): number | null {
    const lista = this.resenas(id);
    return lista.length ? lista.reduce((suma, r) => suma + r.estrellas, 0) / lista.length : null;
  }

  idsConResenas(): number[] {
    return Object.keys(this.resenasGuardadas())
      .map(Number)
      .filter((id) => Number.isInteger(id) && this.resenas(id).length > 0);
  }

  private leerFavoritos(): number[] {
    const v = this.leer<unknown>(CLAVE_FAVORITOS);
    return Array.isArray(v) ? v.filter(Number.isInteger) : [];
  }

  private leerResenas(): Record<string, Resena[]> {
    const t = this.leer<unknown>(CLAVE_RESENAS);
    return t && typeof t === "object" && !Array.isArray(t) ? (t as Record<string, Resena[]>) : {};
  }
}

function esResenaValida(r: Resena | null): r is Resena {
  return !!r && typeof r.autor === "string" && typeof r.texto === "string" && r.estrellas >= 1 && r.estrellas <= 5;
}

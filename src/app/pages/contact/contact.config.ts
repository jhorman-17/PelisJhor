// Datos de contacto que se muestran en /contactos.
// Un campo vacío (null o []) no aparece en la página.
export interface RedSocial {
  nombre: string;
  usuario: string;
  url: string;
}

export const CONTACTO = {
  correo: "jhorjosueisaza@hotmail.com" as string | null,
  telefono: "3144562476" as string | null,
  redes: [
    { nombre: "Instagram", usuario: "@_.jhorman._", url: "https://www.instagram.com/_.jhorman._/" },
    { nombre: "GitHub", usuario: "jhorman-17", url: "https://github.com/jhorman-17" },
  ] as RedSocial[],
  repositorio: "https://github.com/jhorman-17/PelisJhor",
  video: "https://youtu.be/Kl15I3j-47c",
  datosPeliculas: "https://www.themoviedb.org/",
};

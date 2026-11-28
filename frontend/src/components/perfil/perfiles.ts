// PERFILES FICTICIOS. No hay login ni usuarios en el backend: esto es una maqueta para que
// la pantalla tenga dueño, firma y destinatarios con cara. Nada de acá viaja al servidor ni
// autoriza nada -- lo único que cambia es qué ofrece la interfaz.
//
// Si algún día hay autenticación de verdad, este archivo es lo único que se reemplaza: el
// resto del front consume el perfil activo por el contexto, no esta lista.
export interface Perfil {
  id: string
  nombre: string
  rol: string
  correo: string
  iniciales: string
  // Si el perfil "firma" (da el Vo.Bo.). Hoy solo decide qué botones se ven.
  firma: boolean
}

export const PERFILES: Perfil[] = [
  {
    id: "coordinacion",
    nombre: "Marta Giménez",
    rol: "Jefa de carrera",
    correo: "marta.gimenez@matriculas.edu",
    iniciales: "MG",
    firma: true,
  },
  {
    id: "docencia",
    nombre: "Carlos Ríos",
    rol: "Maestro titular",
    correo: "carlos.rios@matriculas.edu",
    iniciales: "CR",
    firma: false,
  },
  {
    id: "control",
    nombre: "Lucía Ferrer",
    rol: "Control escolar",
    correo: "lucia.ferrer@matriculas.edu",
    iniciales: "LF",
    firma: false,
  },
]

export const PERFIL_POR_DEFECTO = PERFILES[0]

const CLAVE_ALMACENADA = "perfil-activo"

// localStorage es por navegador y puede tirar (modo privado, cookies bloqueadas): todo
// envuelto en try/catch y con un perfil por defecto que siempre funciona.
export function leerPerfilGuardado(): Perfil {
  try {
    const id = window.localStorage.getItem(CLAVE_ALMACENADA)
    return PERFILES.find((p) => p.id === id) ?? PERFIL_POR_DEFECTO
  } catch {
    return PERFIL_POR_DEFECTO
  }
}

export function guardarPerfil(id: string) {
  try {
    window.localStorage.setItem(CLAVE_ALMACENADA, id)
  } catch {
    // Sin persistencia: el perfil dura lo que dure la pestaña. No es motivo para romper nada.
  }
}

// Correo ficticio a partir de un nombre del catálogo de responsables: "Marta Giménez" ->
// "marta.gimenez@matriculas.edu". Sirve para que la propuesta de correos tenga
// destinatarios creíbles sin inventarlos a mano uno por uno.
export function correoDe(nombre: string): string {
  const limpio = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".")
  return `${limpio === "" ? "sin.destinatario" : limpio}@matriculas.edu`
}

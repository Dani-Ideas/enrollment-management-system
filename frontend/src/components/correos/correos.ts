import type { SolicitudDTO } from "@/api/types"
import { correoDe, type Perfil } from "@/components/perfil/perfiles"

// CORREOS SIMULADOS. El backend no manda mails: no hay servicio de correo, ni plantillas,
// ni cola de salida. Esto arma la PROPUESTA de lo que se enviaría, con datos reales de la
// solicitud, para que el usuario la revise antes de que "salga". El botón de enviar no
// llega a ninguna red: deja el aviso y marca el correo como despachado en pantalla.
//
// Cuando exista el envío de verdad, lo único que cambia es quién recibe este objeto: el
// armado del asunto y del cuerpo ya está acá, en un solo lugar.

export interface DestinatarioCorreo {
  nombre: string
  correo: string
  rol: string
}

export interface CorreoPropuesto {
  id: string
  motivo: string
  para: DestinatarioCorreo[]
  asunto: string
  cuerpo: string
}

function destinatariosDe(solicitud: SolicitudDTO): DestinatarioCorreo[] {
  // Los tres responsables del catálogo, sin repetir: en varias solicitudes la misma persona
  // ocupa dos roles, y mandarle el mismo correo dos veces queda mal en la propuesta.
  const crudos: DestinatarioCorreo[] = [
    { nombre: solicitud.jefeCarrera, correo: correoDe(solicitud.jefeCarrera), rol: "Jefe de carrera" },
    { nombre: solicitud.maestro, correo: correoDe(solicitud.maestro), rol: "Maestro" },
    { nombre: solicitud.carrera, correo: correoDe(solicitud.carrera), rol: "Carrera" },
  ]
  const vistos = new Set<string>()
  return crudos.filter((d) => {
    if (vistos.has(d.correo)) return false
    vistos.add(d.correo)
    return true
  })
}

function fecha(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso === "") return "sin fecha"
  return iso.slice(0, 10)
}

function firma(perfil: Perfil): string {
  return `\n—\n${perfil.nombre}\n${perfil.rol}\n${perfil.correo}`
}

// Correos de la creación de una solicitud: el alta en sí y, si la cadena sigue, el aviso
// de que el nivel siguiente queda habilitado.
export function correosDeCreacion(
  solicitud: SolicitudDTO,
  perfil: Perfil,
  hayNivelSiguiente: boolean,
): CorreoPropuesto[] {
  const para = destinatariosDe(solicitud)
  const correos: CorreoPropuesto[] = [
    {
      id: "alta",
      motivo: "Al crearse la solicitud",
      para,
      asunto: `Solicitud #${solicitud.id} creada — ${solicitud.proyecto} (${solicitud.version})`,
      cuerpo:
        `Se registró la solicitud de ${solicitud.etapa.toLowerCase()} para ${solicitud.proyecto}, ` +
        `versión ${solicitud.version}, en el ambiente ${solicitud.ambiente}.\n\n` +
        `Sistema: ${solicitud.sistema}\n` +
        `Estado: ${solicitud.estado}\n` +
        `Fecha planteada: ${fecha(solicitud.fechaInscripcionPlanteada)}\n\n` +
        `Queda pendiente cargar checklist, pruebas y documentación para el Vo.Bo.` +
        firma(perfil),
    },
  ]

  if (hayNivelSiguiente) {
    correos.push({
      id: "siguiente",
      motivo: "Cuando el Vo.Bo. de este nivel esté completo",
      para,
      asunto: `Siguiente nivel habilitado — ${solicitud.proyecto} (${solicitud.version})`,
      cuerpo:
        `Con el Vo.Bo. de ${solicitud.etapa.toLowerCase()} completo, la cadena habilita el nivel siguiente.\n\n` +
        `Este aviso sale automáticamente cuando checklist, pruebas y documentación quedan las tres verificadas.` +
        firma(perfil),
    })
  }

  return correos
}

// Correos del cierre de la cadena: el resumen de todo lo enviado.
export function correosDeCadena(
  solicitud: SolicitudDTO,
  perfil: Perfil,
  niveles: string[],
): CorreoPropuesto[] {
  const para = destinatariosDe(solicitud)
  return [
    {
      id: "cadena",
      motivo: "Al cerrar la cadena",
      para,
      asunto: `Cadena completa — ${solicitud.proyecto} (${solicitud.version})`,
      cuerpo:
        `La cadena de ${solicitud.proyecto} quedó registrada con ${niveles.length} nivel` +
        `${niveles.length === 1 ? "" : "es"}: ${niveles.join(", ")}.\n\n` +
        `Ambiente: ${solicitud.ambiente}\n` +
        `Sistema: ${solicitud.sistema}\n\n` +
        `El detalle de cada nivel queda en el panel de la solicitud.` +
        firma(perfil),
    },
  ]
}

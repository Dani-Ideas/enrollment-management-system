import { useQuery } from "@tanstack/react-query"
import { useMatchRoute, type LinkProps } from "@tanstack/react-router"
import {
  Building2Icon,
  FileTextIcon,
  ListIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  type LucideIcon,
} from "lucide-react"
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client"
import type { DrillMenuItem } from "@/components/ui/DrillMenu"

export type SeccionNav = {
  id: string
  label: string
  descripcion?: string
  icon: LucideIcon
  to: LinkProps["to"]
  submenu?: DrillMenuItem[]
}

export function useSecciones(): SeccionNav[] {
  const catalogosQuery = useQuery(CATALOGOS_INSCRIPCION_QUERY)
  const ambientes = catalogosQuery.data?.ambientes ?? []

  function itemConAmbientes(accion: "crear" | "actualizar", label: string, icon: LucideIcon): DrillMenuItem {
    if (ambientes.length === 0) {
      return { to: "/formulario-pago", search: { accion }, label, icon }
    }
    return {
      to: "/formulario-pago",
      label,
      icon,
      submenu: ambientes.map((a) => ({
        to: "/formulario-pago",
        search: { accion, ambiente: String(a.id) },
        label: a.nombre,
        icon: Building2Icon,
      })),
    }
  }

  return [
    {
      id: "docente",
      label: "Para Docente",
      descripcion: "Sitio para los maestros.",
      icon: LogOutIcon,
      to: "/salir-sitio",
    },
    {
      id: "solicitudes",
      label: "Solicitudes",
      descripcion: "Registro, edicion, conulta de solicitudes.",
      icon: FileTextIcon,
      to: "/solicitudes",
      submenu: [
        {
          to: "/formulario-pago",
          search: { accion: "consultar" },
          label: "Inscripciones",
          icon: ListIcon,
        },
        itemConAmbientes("crear", "Crear una solicitud nueva", PlusIcon),
        itemConAmbientes("actualizar", "Actualizar una solicitud existente", PencilIcon),
      ],
    },
  ]
}

export function useSeccionActiva(): SeccionNav | undefined {
  const secciones = useSecciones()
  const matchRoute = useMatchRoute()

  function coincide(to: LinkProps["to"]): boolean {
    return matchRoute({ to } as Parameters<typeof matchRoute>[0]) !== false
  }

  return secciones.find((seccion) => {
    if (coincide(seccion.to)) return true
    return seccion.submenu?.some((item) => coincide(item.to)) ?? false
  })
}

import { useQuery } from "@tanstack/react-query"
import { Building2Icon, FileTextIcon, ListIcon, LogOutIcon, PencilIcon, PlusIcon } from "lucide-react"
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client"
import { DrillMenu, type DrillMenuItem } from "../components/ui/DrillMenu"

export function HomePage() {
  // Mismo catalogo/cache que usa useInscripcionForm (RootLayout.tsx ya lo precarga apenas
  // se entra al sitio) -- "ambientes" hace de "sucursal": varias sucursales comparten el
  // mismo catalogo CAT_AMBIENTE_INSCRIPCION, asi que "crear"/"actualizar" preguntan primero
  // en cual trabajar (un submenu por fila real del catalogo, nunca hardcodeado) antes de
  // entrar al formulario -- ver router.tsx (search.ambiente) y
  // useInscripcionForm.elegirAccion.
  const catalogosQuery = useQuery(CATALOGOS_INSCRIPCION_QUERY)
  const ambientes = catalogosQuery.data?.ambientes ?? []

  function itemConAmbientes(accion: "crear" | "actualizar", label: string, icon: DrillMenuItem["icon"]): DrillMenuItem {
    if (ambientes.length === 0) {
      // Mientras el catalogo todavia no cargo (recien entrando al sitio, antes de que el
      // prefetch de RootLayout resuelva) -- entra directo, sin preguntar ambiente, para no
      // mostrar un submenu vacio.
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

  return (
    <>
      <section className="mb-12">
        <DrillMenu
          items={[
            {
              to: "/salir-sitio",
              label: "Para Docente",
              descripcion: "Sitio para los maestros.",
              icon: LogOutIcon,
            },
            {
              to: "/formulario-pago",
              label: "Solicitudes",
              descripcion: "Registro, edicion, conulta de solicitudes.",
              icon: FileTextIcon,
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
          ]}
        />
      </section>
    </>
  )
}

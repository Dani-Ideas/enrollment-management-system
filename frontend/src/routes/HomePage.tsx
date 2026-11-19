import { FileTextIcon, ListIcon, LogOutIcon, PencilIcon, PlusIcon } from "lucide-react"
import { DrillMenu } from "../components/ui/DrillMenu"

export function HomePage() {
  return (
    <>
      <section>
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
                {
                  to: "/formulario-pago",
                  search: { accion: "crear" },
                  label: "Crear una solicitud nueva",
                  icon: PlusIcon,
                },
                {
                  to: "/formulario-pago",
                  search: { accion: "actualizar" },
                  label: "Actualizar una solicitud existente",
                  icon: PencilIcon,
                },
              ],
            },
          ]}
        />
      </section>
    </>
  )
}

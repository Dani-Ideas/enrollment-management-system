import { FileTextIcon, ListIcon, LogOutIcon, PencilIcon, PlusIcon } from "lucide-react"
import { PieMenu } from "../components/ui/PieMenu"

export function HomePage() {
  return (
    <>
      <section>
        <PieMenu
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
                  search: { accion: "lista" },
                  label: "Ver solicitudes existentes",
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
          size={280}
        />
      </section>
    </>
  )
}

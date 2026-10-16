import { FileTextIcon, ListIcon, LogOutIcon, PencilIcon, PlusIcon } from "lucide-react"
import { PieMenu } from "../components/ui/PieMenu"

// Pagina de la ruta "/" (ver indexRoute en router.tsx). Es la que se ve dentro del
// <Outlet/> de RootLayout cuando entras a la app por primera vez.
//
// La precarga de "tablas genericas" (los 4 catalogos de inscripcion) ya NO vive aca --
// se movio a RootLayout.tsx, que se monta sin importar en que URL arranca/recarga la
// app (este componente, en cambio, solo se monta si entras/recargas por "/").
export function HomePage() {
  return (
    <>
      <section>
        <PieMenu
          items={[
            {
              to: "/salir-sitio",
              label: "Opción 1",
              descripcion: "Te avisa antes de salir del sitio y abre la consola de GlassFish en una pestaña nueva.",
              icon: LogOutIcon,
            },
            {
              to: "/formulario-pago",
              label: "Solicitudes",
              descripcion: "Elegí qué querés hacer con las solicitudes de inscripción.",
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

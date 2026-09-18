import { ClipboardListIcon, FileTextIcon, LogOutIcon } from "lucide-react"
import { PieMenu } from "../components/PieMenu"

// Pagina de la ruta "/" (ver indexRoute en router.tsx). Es la que se ve dentro del
// <Outlet/> de RootLayout cuando entras a la app por primera vez.
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
              descripcion: "Creá una solicitud de implantación nueva o actualizá una existente, con el backend real.",
              icon: FileTextIcon,
            },
            {
              to: "/formulario-largo",
              label: "Solicitudes (formulario completo)",
              descripcion: "El mismo trámite, con el mismo backend real, más la opción de ver la lista completa de solicitudes existentes.",
              icon: ClipboardListIcon,
            },
          ]}
          size={280}
        />
      </section>
    </>
  )
}

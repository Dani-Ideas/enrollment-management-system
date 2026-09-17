import { ClipboardListIcon, GraduationCapIcon, LogOutIcon } from "lucide-react"
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
              label: "Inscripción",
              descripcion: "Identificate como estudiante, elegí una materia de tu carrera, revisá el profesor y los cupos, y matriculate en una clase real.",
              icon: GraduationCapIcon,
            },
            {
              to: "/formulario-largo",
              label: "Inscripción (sin carrusel)",
              descripcion: "El mismo trámite de inscripción, con el mismo backend real, pero como formulario tradicional largo en vez de carrusel.",
              icon: ClipboardListIcon,
            },
          ]}
          size={280}
        />
      </section>
    </>
  )
}

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ClipboardListIcon, FileTextIcon, LogOutIcon } from "lucide-react"
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client"
import { PieMenu } from "../components/PieMenu"

// Pagina de la ruta "/" (ver indexRoute en router.tsx). Es la que se ve dentro del
// <Outlet/> de RootLayout cuando entras a la app por primera vez.
export function HomePage() {
  const queryClient = useQueryClient()

  // Precarga "tablas genericas" (los 4 catalogos de inscripcion) apenas se entra al
  // sitio -- CATALOGOS_INSCRIPCION_QUERY es el MISMO objeto (mismo queryKey/queryFn/
  // staleTime) que usan FormularioPagoPage.tsx e InscripcionWizard.tsx, asi que cuando el
  // usuario llegue a esas pantallas el useQuery encuentra el dato ya cacheado (dentro del
  // staleTime de 5 min) en vez de pedirlo de nuevo. prefetchQuery no hace nada si ya hay
  // datos frescos en cache -- correr esto en cada visita al Home no duplica pedidos.
  useEffect(() => {
    queryClient.prefetchQuery(CATALOGOS_INSCRIPCION_QUERY)
  }, [queryClient])

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
              descripcion: "Creá una solicitud de inscripción nueva o actualizá una existente, con el backend real.",
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

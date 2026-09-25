import { Link } from "@tanstack/react-router"
import { InscripcionWizardTanstack } from "@/components/InscripcionWizard.tanstack"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Variante con TanStack Form de FormularioLargoPage.tsx -- NO registrada en
// router.tsx a proposito (no es una ruta real, es material de referencia).
// Mismo wrapper, apuntando a InscripcionWizardTanstack en vez de
// InscripcionWizard.
export function FormularioLargoPageTanstack() {
  return (
    <section>
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-y bg-background/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/75">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Solicitudes de inscripción (formulario completo, TanStack Form)</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h2>Solicitudes de inscripción (variante TanStack Form)</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Ver, crear o actualizar una solicitud de inscripción -- esta versión incluye
        además la opción de listar todas las solicitudes existentes.
      </p>

      <InscripcionWizardTanstack />
    </section>
  )
}

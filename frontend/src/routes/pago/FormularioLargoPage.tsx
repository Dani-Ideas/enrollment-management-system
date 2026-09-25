import { Link } from "@tanstack/react-router"
import { InscripcionWizard } from "@/components/InscripcionWizard"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Version "larga" del formulario 
export function FormularioLargoPage() {
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
              <BreadcrumbPage>Solicitudes de implantación (formulario completo)</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h2>Solicitudes de implantación</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Ver, crear o actualizar una solicitud de implantación -- esta versión incluye
        además la opción de listar todas las solicitudes existentes.
      </p>

      <InscripcionWizard />
    </section>
  )
}
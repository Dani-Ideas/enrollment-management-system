import { Link } from "@tanstack/react-router"
import { ImplantacionWizard } from "@/components/ImplantacionWizard"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Version "larga" del formulario de implantaciones: mismo dominio, mismo
// backend real, mismo componente ImplantacionWizard que se usa aca abajo --
// la diferencia con "/formulario-pago" es que ahi el carrusel esta escrito
// directo en esa pagina (sin la rama "ver lista"), y aca se delega al
// componente ImplantacionWizard.tsx (que si incluye esa rama). Dos
// presentaciones del mismo dominio, cada una con su propio alcance.
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

      <ImplantacionWizard />
    </section>
  )
}

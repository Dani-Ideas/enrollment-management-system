import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { GraduationCapIcon, LayersIcon } from "lucide-react"
import { fetchSolicitudes } from "@/api/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSeccionActiva, useSecciones } from "./useSecciones"

const ETAPAS = ["Primaria", "Secundaria", "Universidad"] as const

export function AppSidebar() {
  const secciones = useSecciones()
  const activa = useSeccionActiva()

  // Misma queryKey que el tablero y el panel: el contador no agrega una peticion propia,
  // sale de la lista que esas pantallas ya pidieron.
  const solicitudesQuery = useQuery({
    queryKey: ["solicitudes"],
    queryFn: fetchSolicitudes,
    staleTime: 10 * 1000,
  })
  const solicitudes = solicitudesQuery.data ?? []

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Sistema de Matrículas" render={<Link to="/" />}>
              <GraduationCapIcon />
              <span className="font-semibold">Sistema de Matrículas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secciones.map((seccion) => {
                const Icono = seccion.icon
                return (
                  <SidebarMenuItem key={seccion.id}>
                    <SidebarMenuButton
                      isActive={seccion.id === activa?.id}
                      tooltip={seccion.label}
                      render={<Link to={seccion.to} />}
                    >
                      <Icono />
                      <span>{seccion.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* El bloque "Book Formats / 4 Filters" del ejemplo: acá son las etapas de la
            cadena, con el conteo real de cada una. */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Etapas
            <span className="ml-auto text-xs text-sidebar-foreground/60">{solicitudes.length} en total</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ETAPAS.map((etapa) => (
                <SidebarMenuItem key={etapa}>
                  <SidebarMenuButton size="sm" tooltip={etapa} render={<Link to="/solicitudes" />}>
                    <LayersIcon />
                    <span>{etapa}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{solicitudes.filter((s) => s.etapa === etapa).length}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Pie con estado, como el "Ingestion Queue" del ejemplo. Se esconde con el sidebar
          colapsado a iconos, donde no hay ancho para texto. */}
      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2.5 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-sidebar-foreground/70">Cadenas registradas</span>
            <span className="text-xs font-semibold">
              {solicitudes.filter((s) => s.solicitudAnteriorId === null).length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-sidebar-foreground/60">
            {solicitudesQuery.isLoading ? "Cargando…" : "Cada cadena arranca en una primaria"}
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

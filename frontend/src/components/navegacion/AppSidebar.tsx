import { Link } from "@tanstack/react-router"
import { GraduationCapIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSeccionActiva, useSecciones } from "./useSecciones"

export function AppSidebar() {
  const secciones = useSecciones()
  const activa = useSeccionActiva()

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
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client";
import { Toaster } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navegacion/AppSidebar";
import { BuscadorGlobal } from "@/components/navegacion/BuscadorGlobal";
import { MenuPerfil } from "@/components/perfil/MenuPerfil";
import { PerfilProvider } from "@/components/perfil/PerfilContexto";
import { useSeccionActiva } from "@/components/navegacion/useSecciones";

export function RootLayout() {
  const queryClient = useQueryClient();
  const seccionActiva = useSeccionActiva();

  useEffect(() => {
    queryClient.prefetchQuery(CATALOGOS_INSCRIPCION_QUERY);
  }, [queryClient]);

  return (
    <TooltipProvider>
      <PerfilProvider>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset className="min-w-0">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="hidden truncate text-sm font-medium sm:inline">
                {seccionActiva?.label ?? "Inicio"}
              </span>
              <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
                <BuscadorGlobal />
                <Separator orientation="vertical" className="h-4" />
                <MenuPerfil />
              </div>
            </header>

            <main className="w-full min-w-0 flex-1 px-4 pt-8 pb-20 md:px-6 lg:px-8">
              <Outlet />
            </main>
          </SidebarInset>

          <Toaster />
        </SidebarProvider>
      </PerfilProvider>
    </TooltipProvider>
  );
}

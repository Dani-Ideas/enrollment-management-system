import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client";
import { Toaster } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navegacion/AppSidebar";
import { useSeccionActiva } from "@/components/navegacion/useSecciones";

export function RootLayout() {
  const queryClient = useQueryClient();
  const seccionActiva = useSeccionActiva();

  useEffect(() => {
    queryClient.prefetchQuery(CATALOGOS_INSCRIPCION_QUERY);
  }, [queryClient]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="min-w-0">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="truncate text-sm font-medium">{seccionActiva?.label ?? "Inicio"}</span>
          </header>

          <main className="w-full min-w-0 flex-1 px-4 pt-8 pb-20 md:px-6 lg:px-8">
            <Outlet />
          </main>
        </SidebarInset>

        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  );
}

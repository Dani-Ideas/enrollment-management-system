import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client";
import { Toaster } from "@/components/ui/toast";

export function RootLayout() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery(CATALOGOS_INSCRIPCION_QUERY);
  }, [queryClient]);

  return (
    <div className="w-full px-6 pt-12 pb-20 md:px-8 lg:px-12">
      <header className="mb-12 border-b pb-6">
        <h1 className="text-titulo-pagina mb-1.5 font-semibold tracking-titulo">Sistema de Matrículas</h1>
      </header>

      <main>
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}

import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client";
import { Toaster } from "@/components/ui/toast";

// Este componente es el "marco" fijo de toda la app: se renderiza SIEMPRE, sin importar
// en que pagina estes. Es el component: de rootRoute en router.tsx -- por eso el header
// nunca "parpadea" al cambiar de pagina, solo el contenido de <Outlet/> cambia.
//
// Sin <nav> a proposito: la navegacion entre paginas vive en HomePage (la lista de
// botones + el DrillMenu), no en un menu fijo arriba -- para volver a "/" desde cualquier
// pagina, usa el boton "atras" del navegador o escribe la URL.
export function RootLayout() {
  const queryClient = useQueryClient();

  // Precarga "tablas genericas" (los 4 catalogos de inscripcion) apenas arranca la app --
  // ANTES vivia en el useEffect de HomePage.tsx, pero ese componente solo se monta si
  // entras/recargas por "/": recargar parado en "/formulario-pago", por ejemplo, nunca
  // pasaba por HomePage y el prefetch no corria. RootLayout, en cambio, es el component:
  // de rootRoute (ver router.tsx) -- se monta SIEMPRE, sin importar la URL con la que
  // arranco la pagina, asi que esta es la unica ubicacion que garantiza la precarga pase
  // lo que pase. prefetchQuery no hace nada si ya hay datos frescos en cache (dentro del
  // staleTime de 5 min) -- no duplica pedidos en cada cambio de ruta.
  useEffect(() => {
    queryClient.prefetchQuery(CATALOGOS_INSCRIPCION_QUERY);
  }, [queryClient]);

  return (
    // El marco de pagina ya no es una clase CSS propia (.pagina/.encabezado): son
    // utilidades sobre los tokens de index.css. Asi cualquier pagina puede pisar un valor
    // desde su JSX -- con la clase suelta era imposible: estaba fuera de @layer y le
    // ganaba a toda utilidad.
    //
    // ANCHO COMPLETO, sin tope: el marco ocupa el 100% y no hay max-width ni mx-auto en
    // ningun breakpoint (por eso tampoco quedan tokens --container-pagina*). Lo unico que
    // queda son los gutters laterales, que crecen con el viewport; si alguna pagina
    // necesita una columna angosta, se la pone ELLA (ver la rama angosta de
    // FormularioInscripciones), no el marco.
    <div className="w-full px-6 pt-12 pb-20 md:px-8 lg:px-12">
      <header className="mb-12 border-b pb-6">
        <h1 className="text-titulo-pagina mb-1.5 font-semibold tracking-titulo">Sistema de Matrículas</h1>
      </header>

      <main>
        {/* Aqui es donde el router "inserta" la pagina activa segun la URL actual
            (HomePage, SalirSitioPage, FormularioPagoPage o FormularioLargoPage --
            ver router.tsx). */}
        <Outlet />
      </main>

      {/* Contenedor UNICO de los toasts de toda la app -- cualquier pagina los dispara con
          toast.add() (ver components/ui/toast.tsx) y aparecen aqui. */}
      <Toaster />
    </div>
  );
}

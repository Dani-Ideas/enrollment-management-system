import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomePage } from "./routes/HomePage";
import { SalirSitioPage } from "./routes/inscripciones/SalirSitioPage";
import { SeccionPage } from "./routes/SeccionPage";
import { FormularioInscripciones } from "./routes/inscripciones/FormularioInscripciones";


const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Una ruta por seccion del sidebar que tenga submenu: el submenu se dibuja en el
// contenido principal (SeccionPage), no dentro del sidebar. Agregar una seccion nueva con
// submenu = una entrada en useSecciones() + una ruta de estas.
const solicitudesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/solicitudes",
  component: () => <SeccionPage seccionId="solicitudes" />,
});

const salirSitioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salir-sitio",
  component: SalirSitioPage,
});

export type AccionFormularioInscripciones = "lista" | "crear" | "actualizar" | "consultar";

export const formularioPagoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/formulario-pago",
  component: FormularioInscripciones,
  validateSearch: (
    search: Record<string, unknown>,
  ): { accion?: AccionFormularioInscripciones; ambiente?: string } => {
    const accion = search.accion;
    const resultado: { accion?: AccionFormularioInscripciones; ambiente?: string } = {};
    if (accion === "lista" || accion === "crear" || accion === "actualizar" || accion === "consultar") {
      resultado.accion = accion;
    }
    if (typeof search.ambiente === "string" && search.ambiente !== "") {
      resultado.ambiente = search.ambiente;
    }
    return resultado;
  },
});


const routeTree = rootRoute.addChildren([
  indexRoute,
  solicitudesRoute,
  salirSitioRoute,
  formularioPagoRoute,
]);

export const router = createRouter({
  routeTree,
  basepath: "/SistemaMatriculas",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

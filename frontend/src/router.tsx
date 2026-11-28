import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomePage } from "./routes/HomePage";
import { SalirSitioPage } from "./routes/inscripciones/SalirSitioPage";
import { SeccionPage } from "./routes/SeccionPage";
import { PanelSolicitudPage } from "./routes/inscripciones/PanelSolicitudPage";
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
export const solicitudesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/solicitudes",
  component: () => <SeccionPage seccionId="solicitudes" />,
  // "q" es el texto del buscador de la barra superior: viaja por la URL para que la
  // busqueda se pueda compartir y sobreviva al refresh, igual que ?accion= del wizard.
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q !== "" ? { q: search.q } : {},
});

const salirSitioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salir-sitio",
  component: SalirSitioPage,
});

// Panel de UNA solicitud. El id va en la ruta (no en search) porque es la identidad del
// recurso: /solicitud/41 se comparte, se marca y el boton atras funciona.
export const panelSolicitudRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/solicitud/$id",
  component: PanelSolicitudPage,
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
  panelSolicitudRoute,
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

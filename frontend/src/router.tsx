import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomePage } from "./routes/HomePage";
import { SalirSitioPage } from "./routes/inscripciones/SalirSitioPage";
import { FormularioInscripciones } from "./routes/inscripciones/FormularioInscripciones";


const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
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

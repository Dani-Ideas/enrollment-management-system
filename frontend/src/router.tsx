import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomePage } from "./routes/HomePage";
import { SalirSitioPage } from "./routes/pago/SalirSitioPage";
import { FormularioPagoPage } from "./routes/pago/FormularioPagoPage";
import { FormularioLargoPage } from "./routes/pago/FormularioLargoPage";

// Este archivo es el "mapa" completo de la app: que URL corresponde a que componente.
// No dibuja nada el mismo -- solo arma la estructura que despues usa <RouterProvider/>
// en main.tsx.

// La ruta raiz -- SIEMPRE se renderiza, sin importar la URL. Trae el <Outlet/>
// donde se inserta la pagina que corresponda.
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Cada createRoute() es "hijo" de rootRoute, y dice: para esta URL, este componente.
// getParentRoute le dice al router donde "cuelga" esta ruta dentro del arbol (aqui,
// todas cuelgan directo de rootRoute, no hay sub-rutas anidadas todavia).
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Rutas del "menu de pago" de la pagina de inicio.
const salirSitioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salir-sitio",
  component: SalirSitioPage,
});

const formularioPagoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/formulario-pago",
  component: FormularioPagoPage,
});

const formularioLargoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/formulario-largo",
  component: FormularioLargoPage,
});

// Junta las rutas sueltas en un solo arbol -- esto es lo que createRouter necesita para
// saber que existe en la app completa.
const routeTree = rootRoute.addChildren([
  indexRoute,
  salirSitioRoute,
  formularioPagoRoute,
  formularioLargoRoute,
]);

export const router = createRouter({
  routeTree,
  // El WAR se despliega bajo /SistemaMatriculas/, no en la raiz del dominio -- mismo
  // problema que el "base" de Vite (ver vite.config.ts): sin esto, <Link to="/materias">
  // generaria un href de "/materias" a secas (raiz del dominio), en vez de
  // "/SistemaMatriculas/materias" (donde realmente vive el WAR).
  basepath: "/SistemaMatriculas",
});

// Registro de tipos: le da a TypeScript autocompletado y validacion de las rutas que
// existen (por eso <Link to="/productos"> se valida en tiempo de compilacion -- si
// escribieras <Link to="/no-existe">, TypeScript marcaria error antes de correr nada).
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

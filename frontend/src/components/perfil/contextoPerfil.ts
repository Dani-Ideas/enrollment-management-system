import { createContext, use } from "react"
import type { Perfil } from "./perfiles"

export interface PerfilContextoValor {
  perfil: Perfil
  cambiarPerfil: (id: string) => void
}

// El contexto y su hook viven en un .ts aparte del Provider a proposito: un archivo que
// exporta un componente Y otras cosas rompe el fast refresh de Vite (la regla
// only-export-components de oxlint). Acá no hay JSX, así que no es un "archivo de
// componentes".
export const PerfilContexto = createContext<PerfilContextoValor | null>(null)

export function usePerfil(): PerfilContextoValor {
  const valor = use(PerfilContexto)
  if (valor === null) {
    throw new Error("usePerfil necesita estar dentro de <PerfilProvider>")
  }
  return valor
}

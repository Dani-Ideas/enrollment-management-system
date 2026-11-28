import { useState, type ReactNode } from "react"
import { PerfilContexto } from "./contextoPerfil"
import { guardarPerfil, leerPerfilGuardado, type Perfil } from "./perfiles"

// El perfil activo vive en un contexto y no en cada pantalla: lo leen la barra de arriba,
// el inicio y la propuesta de correos del wizard, y todos tienen que ver el mismo.
export function PerfilProvider({ children }: { children: ReactNode }) {
  // Inicializador lazy: lee localStorage UNA vez, en el primer render. Si arrancara con un
  // valor y lo corrigiera en un efecto, media pantalla se renderizaría con el perfil
  // equivocado antes de corregirse.
  const [perfil, setPerfil] = useState<Perfil>(() => leerPerfilGuardado())

  function cambiarPerfil(id: string) {
    guardarPerfil(id)
    setPerfil(leerPerfilGuardado())
  }

  return <PerfilContexto value={{ perfil, cambiarPerfil }}>{children}</PerfilContexto>
}

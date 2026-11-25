import { useEffect, useState } from "react"

// ◽ RESUMEN -- ARCHIVO COMPLETO: decide si el panel se monta (no en mobile).
export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    setCoincide(media.matches)
    function alCambiar(evento: MediaQueryListEvent) {
      setCoincide(evento.matches)
    }
    media.addEventListener("change", alCambiar)
    return () => media.removeEventListener("change", alCambiar)
  }, [query])

  return coincide
}

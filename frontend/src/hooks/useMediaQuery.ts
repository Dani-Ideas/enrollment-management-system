import { useEffect, useState } from "react"

// true/false segun si el media query matchea -- usado para que un componente pesado (ej.
// ResumenCadena) NO SE RENDERICE del todo en mobile, no solo que quede oculto con CSS (eso
// seguiria montando sus children/efectos aunque no se vea). Arranca en "false" (SSR-safe:
// no hay window en el primer render del lado del servidor, aunque esta app es un SPA puro,
// no deberia importar) y se corrige al tiro en el primer efecto.
export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(false)

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

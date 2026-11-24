import { useEffect, useState } from "react"

// true/false segun si el media query matchea -- usado para que un componente pesado (ej.
// ResumenCadena) NO SE RENDERICE del todo en mobile, no solo que quede oculto con CSS (eso
// seguiria montando sus children/efectos aunque no se vea).
//
// OJO con el valor INICIAL: tiene que ser el real ya en el primer render, no "false".
// Arrancando en false, en escritorio el primer render devuelve el arbol angosto, el efecto
// corrige a true y el segundo render devuelve OTRO arbol (ver el ternario de
// FormularioInscripciones: ResizablePanelGroup vs. un <div> suelto). Como el hijo cambia de
// tipo en la misma posicion, React no reconcilia: DESMONTA todo el wizard y lo vuelve a
// montar -- los refs del arbol muerto quedan en null, Embla se destruye y se recrea (api
// nuevo, de vuelta en el slide 0) y los Panel de react-resizable-panels se registran dos
// veces. En mobile eso no pasa nunca (false -> false, no cambia nada), por eso el bug era
// solo de escritorio.
//
// Por eso el inicializador es LAZY (una funcion): matchMedia se lee una sola vez, en el
// primer render, y no en cada render. El guard de "window" es por si algun dia esto se
// renderiza del lado del servidor (hoy es un SPA puro).
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

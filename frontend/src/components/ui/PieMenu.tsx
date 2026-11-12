import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Link, useNavigate, type LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

// Un item puede navegar directo (sin "submenu": hoja) o abrir un anillo con mas items
// (con "submenu") -- recursivo, sin limite de profundidad: un item de "submenu" es
// exactamente del mismo tipo PieMenuItem, puede tener su propio "submenu" adentro.
export type PieMenuItem = {
  to: LinkProps["to"]
  search?: LinkProps["search"]
  label: string
  // Texto de la vista previa que aparece al pasar el mouse/foco sobre la rebanada --
  // solo se usa en el nivel raiz (ver "activo" mas abajo). Opcional: los niveles
  // anidados tipicamente no lo necesitan.
  descripcion?: string
  icon: LucideIcon
  // Si esta presente, el click YA NO navega directo -- dispara la animacion de
  // seleccion (ver elegir()) y, al terminar, estos items aparecen como un anillo nuevo
  // alrededor del disco ya achicado. Si NO esta presente, es una hoja: el click dispara
  // la transicion de pantalla completa (ver irA()) y recien al terminar navega.
  submenu?: PieMenuItem[]
}

type Props = {
  items: PieMenuItem[]
  size?: number
}

// Geometria de un menu tipo "pastel" (pie/radial menu): reparte 360 grados en partes
// iguales segun items.length -- funciona igual si son 2, 3 o 20, porque el angulo de cada
// rebanada siempre es 360/total, nunca un numero fijo. viewBox fijo en 0..200 centrado en
// (100,100); "size" solo escala el <svg> en pantalla, no cambia esta geometria interna.
const CX = 100
const CY = 100
const RADIO = 95
const RADIO_ETIQUETA = RADIO * 0.65

// Efecto "activeOuterRadiusOffset" de Nivo (https://github.com/plouc/nivo) -- la rebanada
// activa crece unas unidades de radio, no cambia de opacidad ni tiñe nada de fondo. Como
// este pastel NO se dibuja con Nivo (es un <path> armado a mano), se logra igual con un
// scale() de CSS centrado en (CX, CY): al escalar desde ese punto, el vertice que ya esta
// en el centro no se mueve, y el borde exterior pasa de RADIO a RADIO + OFFSET_ACTIVO.
const OFFSET_ACTIVO = 8
const ESCALA_ACTIVA = (RADIO + OFFSET_ACTIVO) / RADIO

const DURACION_EXPANDIR_MS = 450
const DURACION_ENCOGER_MS = 300
// Transicion de pantalla completa al elegir una opcion SIN submenu (hoja) -- un circulo
// del color de esa rebanada crece desde su posicion en pantalla hasta tapar todo el
// viewport, y recien ahi se navega de verdad.
const DURACION_PANTALLA_MS = 500

function puntoPolar(radio: number, anguloDeg: number) {
  const rad = (anguloDeg * Math.PI) / 180
  // angulo 0 = arriba (12 en punto), crece en sentido horario. Con radio 0 siempre da
  // (CX, CY) sin importar el angulo -- es lo que permite que un "anillo" con
  // radioInterno=0 colapse a un disco solido.
  return { x: CX + radio * Math.sin(rad), y: CY - radio * Math.cos(rad) }
}

// Una "porcion de anillo" generica (radioInterno/radioExterno parametrizados) -- un disco
// (radioInterno=0, el arco interno colapsa a un punto, queda un gajo solido) y un anillo
// real (radioInterno>0) usan la MISMA estructura de comandos SVG (M A A L A A Z, 7
// comandos fijos) -- eso es lo que le permite al navegador animar la propiedad CSS "d"
// sola, sin JS. Pero no alcanza con que los COMANDOS coincidan: el large-arc-flag de cada
// arco es discreto (CSS no puede interpolar de 0 a 1), asi que si una rebanada natural
// mide <=180° (large-arc=0) y el estado "expandiendo" casi 360° (large-arc=1), el flag
// cambia a mitad de transicion y el arco se deforma un instante. Partir CADA arco en dos
// mitades de como mucho 180° (el angulo medio) garantiza large-arc=0 SIEMPRE, para
// cualquier rebanada chica o para el circulo casi completo por igual.
function pathAnillo(anguloInicioDeg: number, anguloFinDeg: number, radioInterno: number, radioExterno: number) {
  const anguloMedio = (anguloInicioDeg + anguloFinDeg) / 2
  const extInicio = puntoPolar(radioExterno, anguloInicioDeg)
  const extMedio = puntoPolar(radioExterno, anguloMedio)
  const extFin = puntoPolar(radioExterno, anguloFinDeg)
  const intFin = puntoPolar(radioInterno, anguloFinDeg)
  const intMedio = puntoPolar(radioInterno, anguloMedio)
  const intInicio = puntoPolar(radioInterno, anguloInicioDeg)
  return [
    `M ${extInicio.x} ${extInicio.y}`,
    `A ${radioExterno} ${radioExterno} 0 0 1 ${extMedio.x} ${extMedio.y}`,
    `A ${radioExterno} ${radioExterno} 0 0 1 ${extFin.x} ${extFin.y}`,
    `L ${intFin.x} ${intFin.y}`,
    `A ${radioInterno} ${radioInterno} 0 0 0 ${intMedio.x} ${intMedio.y}`,
    `A ${radioInterno} ${radioInterno} 0 0 0 ${intInicio.x} ${intInicio.y}`,
    "Z",
  ].join(" ")
}

// Tono por posicion dentro del nivel; saturacion/luminosidad se aclaran un poco por cada
// nivel de profundidad (mismos numeros que el diseño original tenia a mano para
// raiz=0/submenu=1: sat 55->45, luz 45->60 -- aca generalizados para cualquier profundidad).
function colorDeGajo(indice: number, total: number, profundidad: number) {
  const tono = Math.round((indice * 360) / total)
  const saturacion = Math.max(55 - profundidad * 10, 35)
  const luminosidad = Math.min(45 + profundidad * 15, 75)
  return { css: `hsl(${tono}, ${saturacion}%, ${luminosidad}%)`, tono }
}

// Un eslabon de la cadena de selecciones -- cadena[d] es la opcion elegida en el nivel de
// profundidad d (y en que fase de su animacion esta). cadena.length es la profundidad
// actual: si cadena tiene 2 eslabones, el anillo visible y clickeable ahora mismo es el
// submenu del eslabon 1 (el ultimo).
type Eslabon = { indice: number; fase: "expandiendo" | "encogiendo" | "submenu" }

function radioMaximoDesde(x: number, y: number) {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
}

// Menu tipo "pastel" recursivo: cada nivel ocupa una banda de radio [lo, hi]. Elegir un
// item CON submenu dispara 2 fases (expandir a 360° dentro de la banda, despues encoger
// su radio exterior a la mitad de la banda) y, una vez asentado, libera la mitad externa
// de esa banda para el submenu -- mismo mecanismo que antes, repetido sin limite de
// profundidad. Elegir un item SIN submenu (hoja) dispara la transicion de pantalla
// completa (ver irA) y recien al terminar navega.
export function PieMenu({ items, size = 260 }: Props) {
  const navigate = useNavigate()

  // Hover/foco sobre una rebanada del nivel RAIZ -- controla la vista previa de texto de
  // abajo. Los niveles anidados no la usan (no suele hacer falta ahi).
  const [activo, setActivo] = useState<number | null>(null)

  // La cadena de selecciones confirmadas/animandose -- ver tipo Eslabon arriba. [] = menu
  // normal, nada elegido todavia.
  const [cadena, setCadena] = useState<Eslabon[]>([])

  // Transicion de pantalla completa (hoja elegida) -- null = no hay ninguna en curso.
  const [transicion, setTransicion] = useState<{
    x: number
    y: number
    color: string
    to: LinkProps["to"]
    search?: LinkProps["search"]
  } | null>(null)
  const [transicionExpandida, setTransicionExpandida] = useState(false)

  // Encadena expandiendo -> encogiendo -> submenu para el ULTIMO eslabon (el que esta
  // animandose ahora) -- los eslabones anteriores en la cadena ya estan asentados
  // ("submenu") y no se tocan.
  useEffect(() => {
    const profundidad = cadena.length - 1
    if (profundidad < 0) return
    const actual = cadena[profundidad]
    if (actual.fase === "expandiendo") {
      const id = setTimeout(() => asentarFase(profundidad, "encogiendo"), DURACION_EXPANDIR_MS)
      return () => clearTimeout(id)
    }
    if (actual.fase === "encogiendo") {
      const id = setTimeout(() => asentarFase(profundidad, "submenu"), DURACION_ENCOGER_MS)
      return () => clearTimeout(id)
    }
    // "submenu": asentado, no hay timeout pendiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadena])

  // Una vez que el circulo de pantalla completa termino de expandirse, ahi si se navega
  // de verdad -- la navegacion nunca pasa antes de que la transicion se vea completa.
  useEffect(() => {
    if (!transicion || !transicionExpandida) return
    const id = setTimeout(() => {
      navigate({ to: transicion.to, search: transicion.search } as Parameters<typeof navigate>[0])
    }, DURACION_PANTALLA_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transicion, transicionExpandida])

  function asentarFase(profundidad: number, fase: Eslabon["fase"]) {
    setCadena((actual) => actual.map((eslabon, i) => (i === profundidad ? { ...eslabon, fase } : eslabon)))
  }

  function elegir(profundidad: number, indice: number) {
    setCadena((actual) => {
      if (actual[profundidad]?.indice === indice) {
        // Click de nuevo sobre la ya elegida en este nivel -- cierra este nivel Y los mas
        // profundos que colgaban de el.
        return actual.slice(0, profundidad)
      }
      return [...actual.slice(0, profundidad), { indice, fase: "expandiendo" }]
    })
  }

  // Hoja elegida: arranca el circulo en el centro de SU PROPIA rebanada en pantalla (no en
  // el centro del <svg> completo) y recien cuando termina de tapar todo navega de verdad.
  function irA(item: PieMenuItem, color: string, evento: React.MouseEvent<HTMLAnchorElement>) {
    evento.preventDefault()
    const caja = evento.currentTarget.getBoundingClientRect()
    setTransicion({ x: caja.left + caja.width / 2, y: caja.top + caja.height / 2, color, to: item.to, search: item.search })
    setTransicionExpandida(false)
    // Dos rAF (no uno): garantiza que el navegador pinte el circulo en radio 0 ANTES de
    // pasar al radio final -- si se hace en el mismo tick, React puede saltarse el frame
    // intermedio y la transicion de CSS nunca se ve animar, salta directo al final.
    requestAnimationFrame(() => requestAnimationFrame(() => setTransicionExpandida(true)))
  }

  if (items.length === 0) return null

  const itemActivo = activo !== null ? items[activo] : null
  const tonoActivo = activo !== null ? colorDeGajo(activo, items.length, 0).tono : null

  // Nivel recursivo: dibuja "itemsNivel" repartidos en la banda [lo, hi]. "profundidad"
  // indexa dentro de "cadena" (cadena[profundidad] = la eleccion de ESTE nivel, si hay).
  function nivel(itemsNivel: PieMenuItem[], profundidad: number, lo: number, hi: number): ReactNode {
    const total = itemsNivel.length
    const eslabon = cadena[profundidad]
    const hayEleccionEnEsteNivel = eslabon !== undefined
    const medioBanda = (lo + hi) / 2

    return (
      <Fragment>
        {itemsNivel.map((item, indice) => {
          const inicioNatural = (indice * 360) / total
          const finNatural = ((indice + 1) * 360) / total
          const medioAngulo = (inicioNatural + finNatural) / 2
          const Icono = item.icon
          const { css: color } = colorDeGajo(indice, total, profundidad)

          const esElegido = eslabon?.indice === indice
          const fase = esElegido ? eslabon.fase : null
          const asentado = fase === "submenu"

          const anguloFin = esElegido && fase ? inicioNatural + 359.99 : finNatural
          const radioExterno = esElegido && (fase === "encogiendo" || fase === "submenu") ? medioBanda : hi
          const duracionD = fase === "encogiendo" ? DURACION_ENCOGER_MS : DURACION_EXPANDIR_MS
          const d = pathAnillo(inicioNatural, anguloFin, lo, radioExterno)

          // Radio donde se centra la etiqueta (icono+texto) de la rebanada SIN elegir --
          // RADIO_ETIQUETA solo tiene sentido para la banda raiz completa; en una banda
          // anidada [lo,hi] mas angosta, el punto medio de esa banda cumple el mismo rol.
          const radioEtiquetaNormal = lo === 0 ? RADIO_ETIQUETA : medioBanda
          // Asentado: el disco/anillo ya es un solo color de borde a borde (0..360°) --
          // la etiqueta ya no tiene un "angulo propio" que la distinga, se centra en el
          // medio geometrico de la forma resultante. Si lo=0 (nivel raiz) esa forma es un
          // disco real, centrado en (CX,CY); si lo>0 es un anillo, no hay "centro" dentro
          // de el, asi que se ubica a su radio medio, arriba (angulo 0).
          const radioMedioAsentado = (lo + medioBanda) / 2
          const etiqueta = asentado
            ? lo === 0
              ? { x: CX, y: CY }
              : puntoPolar(radioMedioAsentado, 0)
            : puntoPolar(radioEtiquetaNormal, medioAngulo)

          const hayAlgoElegido = hayEleccionEnEsteNivel

          return (
            <Fragment key={String(item.to) + String(item.search ?? "") + indice}>
              <Link
                to={item.to}
                search={item.search}
                className="group/gajo outline-none"
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault()
                    elegir(profundidad, indice)
                    return
                  }
                  irA(item, color, e)
                }}
                onMouseEnter={() => profundidad === 0 && setActivo(indice)}
                onMouseLeave={() => profundidad === 0 && setActivo((a) => (a === indice ? null : a))}
                onFocus={() => profundidad === 0 && setActivo(indice)}
                onBlur={() => profundidad === 0 && setActivo((a) => (a === indice ? null : a))}
              >
                <path
                  d={d}
                  fill={color}
                  stroke="var(--background)"
                  strokeWidth={Math.max(3 - profundidad, 1.5)}
                  style={
                    {
                      d: `path("${d}")`,
                      transformBox: "view-box",
                      transformOrigin: `${CX}px ${CY}px`,
                      "--escala-activa": ESCALA_ACTIVA,
                      transition: `d ${duracionD}ms ease-in-out, opacity 200ms ease-out, scale 300ms ease-out`,
                      opacity: hayAlgoElegido && !esElegido ? 0 : undefined,
                      pointerEvents: hayAlgoElegido && !esElegido ? "none" : undefined,
                      scale: esElegido ? "1" : undefined,
                    } as CSSProperties
                  }
                  className="cursor-pointer group-hover/gajo:opacity-85 group-hover/gajo:scale-[var(--escala-activa)] group-focus-visible/gajo:opacity-85 group-focus-visible/gajo:scale-[var(--escala-activa)]"
                />
                <foreignObject
                  x={etiqueta.x - 40}
                  y={etiqueta.y - 34}
                  width={80}
                  height={68}
                  className="pointer-events-none transition-[x,y] duration-300 ease-in-out"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-white">
                    <Icono className="size-5" />
                    <span className="text-xs leading-tight font-medium">{item.label}</span>
                  </div>
                </foreignObject>
                <title>{item.label}</title>
              </Link>

              {/* Submenu de ESTE item, una vez asentado -- se llama a si misma (nivel()),
                  banda [medioBanda, hi]: la mitad externa que el disco/anillo elegido
                  liberó al encogerse. Recursivo: el submenu de un submenu usa exactamente
                  este mismo codigo, una banda mas hacia afuera cada vez. */}
              {asentado && item.submenu && nivel(item.submenu, profundidad + 1, medioBanda, hi)}
            </Fragment>
          )
        })}
      </Fragment>
    )
  }

  return (
    <div className="mx-auto" style={{ maxWidth: size }}>
      <div className="rounded-2xl p-4">
        <svg viewBox="0 0 200 200" role="img" aria-label="Menú de opciones" className="mx-auto h-auto w-full">
          {nivel(items, 0, 0, RADIO)}
        </svg>
      </div>

      {/* Vista previa de texto: siempre ocupa el mismo alto (min-h) para que el layout de
          abajo no "salte" al aparecer/desaparecer, y solo cambia su opacidad -- así la
          transición se siente como un fade, no como un contenido que entra empujando. */}
      <div className="mt-3 min-h-16 text-center">
        {itemActivo?.descripcion && (
          <div className="animate-in fade-in duration-200">
            <p className="text-sm font-semibold" style={{ color: `hsl(${tonoActivo}, 55%, 45%)` }}>
              {itemActivo.label}
            </p>
            <p className="text-xs text-muted-foreground">{itemActivo.descripcion}</p>
          </div>
        )}
      </div>

      {/* Transicion de pantalla completa: un overlay FIJO a la ventana (no al <svg>, que
          puede ser mas chico que la pantalla) -- un circulo recortado con clip-path que
          crece desde el punto donde se eligio la hoja hasta tapar la pantalla entera. */}
      {transicion && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 transition-[clip-path] ease-in"
          style={{
            backgroundColor: transicion.color,
            clipPath: `circle(${transicionExpandida ? radioMaximoDesde(transicion.x, transicion.y) : 0}px at ${transicion.x}px ${transicion.y}px)`,
            transitionDuration: `${DURACION_PANTALLA_MS}ms`,
          }}
        />
      )}
    </div>
  )
}

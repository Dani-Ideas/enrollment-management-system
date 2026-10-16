import { Fragment, useEffect, useState, type CSSProperties } from "react"
import { Link, type LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

// Opcion dentro del anillo de submenu que envuelve a la rebanada elegida (ver fase
// "submenu" mas abajo) -- misma mecanica de anillo que el menu principal, no un grid de
// botones aparte: cada opcion es su propia porcion de ese anillo.
export type PieMenuSubItem = {
  to: LinkProps["to"]
  search?: LinkProps["search"]
  label: string
  icon: LucideIcon
}

export type PieMenuItem = {
  to: LinkProps["to"]
  label: string
  // Texto de la vista previa que aparece al pasar el mouse/foco sobre la rebanada --
  // que "espera" al usuario si le da clic a esta opcion.
  descripcion: string
  icon: LucideIcon
  // Si esta presente, el click YA NO navega directo -- dispara la animacion de
  // seleccion (ver alElegir) y, al terminar, estas opciones aparecen como un anillo
  // nuevo alrededor del disco principal, ya achicado.
  submenu?: PieMenuSubItem[]
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

// Al elegir una opcion con submenu, en 2 pasos: (1) su angulo crece hasta cubrir el 100%
// del circulo -- "toma protagonismo" del disco principal -- y (2) RECIEN DESPUES ese
// mismo disco, ya entero de un solo color, se achica (el radio EXTERIOR baja de RADIO a
// RADIO_PRINCIPAL_CHICO). El espacio que queda libre entre ese disco achicado y RADIO es
// donde aparece el anillo del submenu -- las opciones envuelven al disco principal por
// afuera, no van adentro de un agujero. Por eso el anillo nunca necesita que el <svg>
// crezca: siempre reusa el mismo RADIO de siempre, solo redistribuido.
const RADIO_PRINCIPAL_CHICO = RADIO * 0.5
const DURACION_EXPANDIR_MS = 450
const DURACION_ENCOGER_MS = 300

function puntoPolar(radio: number, anguloDeg: number) {
  const rad = (anguloDeg * Math.PI) / 180
  // angulo 0 = arriba (12 en punto), crece en sentido horario -- mismo criterio que ya
  // se usaba en el menu anterior. Con radio 0 siempre da (CX, CY) sin importar el angulo
  // -- es lo que permite que un "anillo" con radioInterno=0 colapse a un disco solido.
  return { x: CX + radio * Math.sin(rad), y: CY - radio * Math.cos(rad) }
}

// Una "porcion de anillo" generica (radioInterno/radioExterno parametrizados) -- el disco
// principal es un caso particular (radioInterno=0, ahi el "arco interno" colapsa a un
// punto y no se ve nada, queda igual a un gajo solido de toda la vida) y el submenu es
// otro (radioInterno=RADIO_PRINCIPAL_CHICO, radioExterno=RADIO, un anillo real). Usar
// SIEMPRE esta misma estructura de comandos SVG (M A A L A A Z, 7 comandos fijos) es lo
// que le permite al navegador animar la propiedad CSS "d" sola, sin JS -- pero no alcanza
// con que los COMANDOS coincidan: el large-arc-flag de cada arco es discreto (CSS no
// puede interpolar de 0 a 1), asi que si una rebanada natural mide <=180° (large-arc=0) y
// el estado "expandiendo" casi 360° (large-arc=1), el flag cambia a mitad de transicion y
// el arco se deforma un instante -- esto es lo que generaba el "salto" al hacer click.
// Partir CADA arco en dos mitades de como mucho 180° (el angulo medio) garantiza
// large-arc=0 SIEMPRE, para cualquier rebanada chica o para el circulo casi completo por
// igual -- el flag nunca necesita cambiar, solo los numeros (que si interpolan bien).
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

// Mismo tono que ya se usaba por rebanada (HSL repartido segun la posicion), pero
// parametrizado para poder pedirlo tambien fuera del render de cada <path> -- lo usan
// tanto el relleno de la rebanada como el fondo/la vista previa cuando esta activa.
function tonoDeGajo(indice: number, total: number) {
  return Math.round((indice * 360) / total)
}

// Menu tipo "pastel": cada rebanada ocupa 360/items.length. Las que NO tienen "submenu"
// navegan directo al click, como siempre. Las que SI tienen: el click dispara la
// animacion de seleccion -- se expande a todo el circulo, DESPUES se achica (ver
// RADIO_PRINCIPAL_CHICO arriba) -- y una vez achicada, el submenu aparece como un anillo
// nuevo envolviendola. Click de nuevo sobre la elegida (o elegir otra rebanada) cierra y
// vuelve al menu normal.
export function PieMenu({ items, size = 260 }: Props) {
  const total = items.length
  // Rebanada con hover/foco encima ahora mismo (null = ninguna) -- controla la vista previa
  // de texto de abajo (el crecimiento de radio al hacer hover es puro CSS, no depende de
  // este estado).
  const [activo, setActivo] = useState<number | null>(null)

  // Rebanada elegida (click) -- null = menu normal, todas del mismo tamaño.
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  // "expandiendo": la elegida esta creciendo de su angulo natural a (casi) 360°.
  // "encogiendo": ya cubre el circulo entero y ahora es su radio EXTERIOR el que esta
  // bajando (el disco se achica). "submenu": ya esta achicado, el anillo de opciones esta
  // visible alrededor. null: nada seleccionado, fases no aplican.
  const [fase, setFase] = useState<"expandiendo" | "encogiendo" | "submenu" | null>(null)

  // Encadena las 3 fases en orden -- cada una espera a que la anterior termine de verdad
  // (por eso los timeouts en vez de dispararlas juntas): expandir, despues achicar,
  // despues mostrar el submenu.
  useEffect(() => {
    if (fase !== "expandiendo") return
    const id = setTimeout(() => setFase("encogiendo"), DURACION_EXPANDIR_MS)
    return () => clearTimeout(id)
  }, [fase])

  useEffect(() => {
    if (fase !== "encogiendo") return
    const id = setTimeout(() => setFase("submenu"), DURACION_ENCOGER_MS)
    return () => clearTimeout(id)
  }, [fase])

  if (total === 0) return null

  const itemActivo = activo !== null ? items[activo] : null
  const tonoActivo = activo !== null ? tonoDeGajo(activo, total) : null
  const hayAlgoElegido = seleccionado !== null

  function alElegir(indice: number) {
    if (seleccionado === indice) {
      // Click de nuevo sobre la ya elegida -- cierra, vuelve al menu normal.
      setSeleccionado(null)
      setFase(null)
      return
    }
    setSeleccionado(indice)
    setFase("expandiendo")
  }

  return (
    <div className="mx-auto" style={{ maxWidth: size }}>
      <div className="rounded-2xl p-4">
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label="Menú de opciones"
          className="mx-auto h-auto w-full"
        >
          {items.map((item, indice) => {
            const inicioNatural = (indice * 360) / total
            const finNatural = ((indice + 1) * 360) / total
            const medio = (inicioNatural + finNatural) / 2
            const Icono = item.icon
            // Color repartido en HSL segun la posicion -- si manana items.length cambia (3,
            // 7, 20...), los colores se siguen repartiendo parejos solos, sin tocar nada aqui.
            const color = `hsl(${tonoDeGajo(indice, total)}, 55%, 45%)`

            const esElegido = seleccionado === indice
            const enSubmenu = esElegido && fase === "submenu"

            // El angulo de INICIO queda fijo siempre -- esta rebanada "traga" el resto del
            // circulo en sentido horario desde su propio borde izquierdo. 359.99 y no 360:
            // un arco SVG de un punto a si mismo no se puede trazar (queda invisible), asi
            // que nunca se cierra el circulo exacto, un pelo menos alcanza para que se vea
            // completo.
            const anguloFin = esElegido && fase ? inicioNatural + 359.99 : finNatural
            const radioExterno = esElegido && (fase === "encogiendo" || fase === "submenu") ? RADIO_PRINCIPAL_CHICO : RADIO
            const duracionD = fase === "encogiendo" ? DURACION_ENCOGER_MS : DURACION_EXPANDIR_MS
            const d = pathAnillo(inicioNatural, anguloFin, 0, radioExterno)

            // La etiqueta (icono + texto) se centra en (CX, CY) una vez achicado el disco
            // -- offset por angulo ya no tiene sentido para un disco que ya es un solo
            // color parejo. En el estado normal sigue en su posicion de siempre.
            const etiqueta = enSubmenu ? { x: CX, y: CY } : puntoPolar(RADIO_ETIQUETA, medio)

            return (
              <Fragment key={String(item.to)}>
                <Link
                  to={item.to}
                  className="group/gajo outline-none"
                  onClick={(e) => {
                    if (!item.submenu) return
                    e.preventDefault()
                    alElegir(indice)
                  }}
                  onMouseEnter={() => setActivo(indice)}
                  onMouseLeave={() => setActivo((actual) => (actual === indice ? null : actual))}
                  onFocus={() => setActivo(indice)}
                  onBlur={() => setActivo((actual) => (actual === indice ? null : actual))}
                >
                  <path
                    d={d}
                    fill={color}
                    stroke="var(--background)"
                    strokeWidth={3}
                    style={{
                      // La propiedad CSS "d" (no el atributo) es la que el navegador puede
                      // animar -- por eso el wrapper path("..."). El atributo de arriba queda
                      // como fallback para el primer render / navegadores sin soporte.
                      d: `path("${d}")`,
                      // Sin esto, algunos navegadores calculan transform-origin relativo
                      // al bounding box PROPIO del path (que cambia de tamaño/posicion
                      // durante la animacion) en vez del viewBox completo -- por eso el
                      // "crecer desde el centro" se veia tirar hacia (0,0) del contenedor.
                      transformBox: "view-box",
                      transformOrigin: `${CX}px ${CY}px`,
                      "--escala-activa": ESCALA_ACTIVA,
                      transition: `d ${duracionD}ms ease-in-out, opacity 200ms ease-out, scale 300ms ease-out`,
                      // Mientras hay algo elegido, las demas se desvanecen -- la elegida no
                      // necesita el "pop" de hover encima del crecimiento que ya esta haciendo.
                      opacity: hayAlgoElegido && !esElegido ? 0 : undefined,
                      pointerEvents: hayAlgoElegido && !esElegido ? "none" : undefined,
                      // "1", NO el numero 1 -- React le agrega "px" a numeros en estilos
                      // para propiedades que no reconoce como "sin unidad", y "scale" es
                      // nueva (CSS Transforms Level 2); "1px" es invalido para scale, el
                      // navegador lo descarta entero y queda ganando la regla de hover de
                      // abajo (el "pop" de +8 de radio, aunque esto este seleccionado).
                      scale: esElegido ? "1" : undefined,
                    } as CSSProperties}
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

                {/* Anillo de submenu -- envuelve al disco principal ya achicado, mismo
                    RADIO de siempre como borde exterior (nunca hace falta agrandar el
                    <svg>). SIEMPRE fuera del <Link> de la rebanada: un <a> dentro de otro
                    <a> es HTML invalido. */}
                {enSubmenu &&
                  item.submenu &&
                  item.submenu.map((sub, subIndice) => {
                    const totalSub = item.submenu!.length
                    const subInicio = (subIndice * 360) / totalSub
                    const subFin = ((subIndice + 1) * 360) / totalSub
                    const subMedio = (subInicio + subFin) / 2
                    const subEtiqueta = puntoPolar((RADIO_PRINCIPAL_CHICO + RADIO) / 2, subMedio)
                    const SubIcono = sub.icon
                    const subD = pathAnillo(subInicio, subFin, RADIO_PRINCIPAL_CHICO, RADIO)
                    const subColor = `hsl(${tonoDeGajo(subIndice, totalSub)}, 45%, 60%)`

                    return (
                      <Link
                        // "to" solo no alcanza de key aca -- las 3 opciones del submenu
                        // de "Solicitudes" apuntan al MISMO "to" (solo cambia el
                        // "search"), asi que colisionaban (warning de React: "two
                        // children with the same key").
                        key={subIndice}
                        to={sub.to}
                        search={sub.search}
                        className="group/subgajo outline-none animate-in fade-in duration-200"
                      >
                        <path
                          d={subD}
                          fill={subColor}
                          stroke="var(--background)"
                          strokeWidth={2}
                          className="cursor-pointer transition-opacity group-hover/subgajo:opacity-80 group-focus-visible/subgajo:opacity-80"
                        />
                        <foreignObject
                          x={subEtiqueta.x - 35}
                          y={subEtiqueta.y - 28}
                          width={70}
                          height={56}
                          className="pointer-events-none"
                        >
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-white">
                            <SubIcono className="size-4" />
                            <span className="text-[10px] leading-tight font-medium">{sub.label}</span>
                          </div>
                        </foreignObject>
                        <title>{sub.label}</title>
                      </Link>
                    )
                  })}
              </Fragment>
            )
          })}
        </svg>
      </div>

      {/* Vista previa de texto: siempre ocupa el mismo alto (min-h) para que el layout de
          abajo no "salte" al aparecer/desaparecer, y solo cambia su opacidad -- así la
          transición se siente como un fade, no como un contenido que entra empujando. */}
      <div className="mt-3 min-h-16 text-center">
        {itemActivo && (
          <div className="animate-in fade-in duration-200">
            <p className="text-sm font-semibold" style={{ color: `hsl(${tonoActivo}, 55%, 45%)` }}>
              {itemActivo.label}
            </p>
            <p className="text-xs text-muted-foreground">{itemActivo.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  )
}

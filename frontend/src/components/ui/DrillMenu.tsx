import { Fragment, useEffect, useRef, useState } from "react"
import { useNavigate, type LinkProps } from "@tanstack/react-router"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Un item puede navegar directo (sin "submenu": hoja) o abrir una nueva lista de bullets
// (con "submenu") -- recursivo, sin limite de profundidad. Mismo shape que el PieMenuItem
// que reemplaza este componente: HomePage.tsx no cambia su arreglo de items.
export type DrillMenuItem = {
  to: LinkProps["to"]
  search?: LinkProps["search"]
  label: string
  descripcion?: string
  icon: LucideIcon
  submenu?: DrillMenuItem[]
}

type Props = {
  items: DrillMenuItem[]
}

// Cuanto se desenfoca/oscurece un nivel segun su distancia al centro del scroll -- los
// UNICOS numeros a tocar para ajustar esa sensacion ("el protagonista nitido en el centro,
// el resto perceptible pero desenfocado/opaco, nunca oculto del todo").
const BLUR_MAXIMO_PX = 6
const OPACIDAD_MINIMA = 0.45
const ESCALA_MINIMA = 0.92

// Menu de "perillas" (radio bullets) con drill-down tipo iOS Settings. Cada nivel ya
// recorrido queda apilado en una columna con scroll-snap NATIVO (snap-y snap-mandatory +
// snap-always en cada nivel) -- eso es lo que garantiza que el scroll SIEMPRE termina
// centrado en un nivel entero, nunca a mitad de camino entre dos (no hace falta logica
// propia para eso, el navegador lo resuelve solo). El desenfoque/opacidad/escala de los
// niveles que no estan centrados se recalcula en cada frame de scroll y se pisa directo por
// ref (no por estado de React, seria un re-render por frame). Mobile first: las clases base
// son para una columna angosta tactil, sm/md solo angostan el maxWidth y agrandan el
// padding.
export function DrillMenu({ items }: Props) {
  const navigate = useNavigate()
  const [caminoIndices, setCaminoIndices] = useState<number[]>([])
  const contenedorRef = useRef<HTMLDivElement>(null)
  const nivelRefs = useRef<(HTMLDivElement | null)[]>([])
  const montadoRef = useRef(false)
  // true mientras un scrollIntoView disparado por codigo (no por el usuario arrastrando o
  // usando la rueda) todavia puede estar animando -- ver alAsentarse().
  const programaticoRef = useRef(false)

  function nivelEn(profundidad: number): DrillMenuItem[] {
    let lista = items
    for (let i = 0; i < profundidad; i++) {
      lista = lista[caminoIndices[i]].submenu!
    }
    return lista
  }

  // Un nivel por paso ya recorrido + el nivel actual (sin elegir todavia).
  const niveles = Array.from({ length: caminoIndices.length + 1 }, (_, profundidad) => nivelEn(profundidad))
  const caminoItems = caminoIndices.map((indice, profundidad) => nivelEn(profundidad)[indice])

  // Elegir en CUALQUIER nivel visible (no solo el ultimo) -- volver a un nivel ya recorrido
  // y elegir una rama distinta trunca lo que colgaba de la eleccion vieja.
  function elegir(profundidad: number, indice: number) {
    const item = nivelEn(profundidad)[indice]
    if (item.submenu) {
      setCaminoIndices((actual) => [...actual.slice(0, profundidad), indice])
    } else {
      navigate({ to: item.to, search: item.search } as Parameters<typeof navigate>[0])
    }
  }

  function volverA(profundidad: number) {
    setCaminoIndices((actual) => actual.slice(0, profundidad))
  }

  // nivel.offsetTop es relativo al ancestro posicionado mas cercano, NO al contenedor de
  // scroll -- si hay cualquier cosa posicionada entre medio (o el contenedor mismo no es el
  // offsetParent), queda mal. getBoundingClientRect() da la posicion real en pantalla, y
  // restando la del contenedor (mas su scrollTop actual) da el top relativo al contenido
  // scrolleable que realmente hace falta para centrar o medir distancias.
  function topRelativoAlContenedor(nivel: HTMLDivElement, contenedor: HTMLDivElement) {
    return nivel.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop
  }

  // scrollIntoView({block:"center"}) resulto pelearse con el scroll-snap nativo (el
  // contenedor quedaba a mitad de camino, ni en 0 ni centrado) -- calcular el scrollTop
  // exacto a mano y pisarlo directo es lo unico que lo deja siempre perfectamente centrado.
  function centrarNivel(profundidad: number, animado: boolean) {
    const contenedor = contenedorRef.current
    const nivel = nivelRefs.current[profundidad]
    if (!contenedor || !nivel) return
    const destino = topRelativoAlContenedor(nivel, contenedor) + nivel.offsetHeight / 2 - contenedor.clientHeight / 2
    contenedor.scrollTo({ top: destino, behavior: animado ? "smooth" : "auto" })
  }

  // Desenfoque/opacidad/escala continuos segun la distancia de cada nivel al centro del
  // contenedor, recalculados en cada scroll (drag, rueda o el scrollIntoView programatico de
  // mas abajo pasan todos por aca). Cuando el scroll se asienta (120ms sin moverse, ya
  // snapeado a un nivel por el CSS) sincroniza caminoIndices con el nivel que quedo
  // centrado -- asi "elegido" nunca queda desincronizado de lo que el usuario ve, tambien
  // si llego ahi a mano con la rueda/drag en vez de clickeando una perilla.
  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor) return

    let frame = 0
    let temporizadorAsentado: ReturnType<typeof setTimeout>

    function aplicarEstilos() {
      const centroContenedor = contenedor!.scrollTop + contenedor!.clientHeight / 2
      nivelRefs.current.forEach((nivel) => {
        if (!nivel) return
        const centroNivel = topRelativoAlContenedor(nivel, contenedor!) + nivel.offsetHeight / 2
        const distancia = Math.min(1, Math.abs(centroNivel - centroContenedor) / contenedor!.clientHeight)
        nivel.style.filter = `blur(${distancia * BLUR_MAXIMO_PX}px) grayscale(${distancia})`
        nivel.style.opacity = String(1 - distancia * (1 - OPACIDAD_MINIMA))
        nivel.style.transform = `scale(${1 - distancia * (1 - ESCALA_MINIMA)})`
      })
    }

    function alAsentarse() {
      // Si el scroll en curso es el que dispara el propio scrollIntoView programatico (al
      // elegir un item o volver con el breadcrumb), ignora este asentamiento -- si no, esta
      // misma sincronizacion termina truncando caminoIndices de vuelta porque lee la
      // geometria antes de que la animacion termine de acomodarse.
      if (programaticoRef.current) return
      const centroContenedor = contenedor!.scrollTop + contenedor!.clientHeight / 2
      let masCercano = 0
      let menorDistancia = Infinity
      nivelRefs.current.forEach((nivel, indice) => {
        if (!nivel) return
        const centroNivel = topRelativoAlContenedor(nivel, contenedor!) + nivel.offsetHeight / 2
        const distancia = Math.abs(centroNivel - centroContenedor)
        if (distancia < menorDistancia) {
          menorDistancia = distancia
          masCercano = indice
        }
      })
      setCaminoIndices((actual) => (masCercano < actual.length ? actual.slice(0, masCercano) : actual))
    }

    function alHacerScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(aplicarEstilos)
      clearTimeout(temporizadorAsentado)
      temporizadorAsentado = setTimeout(alAsentarse, 120)
    }

    contenedor.addEventListener("scroll", alHacerScroll, { passive: true })
    aplicarEstilos()
    return () => {
      contenedor.removeEventListener("scroll", alHacerScroll)
      cancelAnimationFrame(frame)
      clearTimeout(temporizadorAsentado)
    }
  }, [niveles.length])

  // Cuando se agrega un nivel nuevo (se elige un item con submenu) o se vuelve atras con el
  // breadcrumb, desliza hasta centrar el nivel que quedo activo -- el usuario nunca tiene que
  // desplazarse el mismo para verlo. En el primer montaje tambien centra (sin esto el nivel
  // raiz queda a la deriva donde el navegador lo haya asentado, nunca exactamente en el
  // centro, y sale desenfocado desde el primer render), pero sin animacion para no generar
  // un salto de scroll apenas carga la pagina. programaticoRef evita que el sincronizador de
  // scroll manual (en el efecto de arriba) truncate caminoIndices de vuelta mientras este
  // scroll todavia esta acomodandose.
  useEffect(() => {
    const esPrimerMontaje = !montadoRef.current
    montadoRef.current = true
    programaticoRef.current = true
    centrarNivel(niveles.length - 1, !esPrimerMontaje)
    const liberar = setTimeout(() => {
      programaticoRef.current = false
    }, 700)
    return () => clearTimeout(liberar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niveles.length])

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
      {caminoItems.length > 0 && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => volverA(0)}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            {caminoItems.map((item, indice) => (
              <Fragment key={item.label}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {indice === caminoItems.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink className="cursor-pointer" onClick={() => volverA(indice + 1)}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div
        ref={contenedorRef}
        className="flex h-[min(70vh,32rem)] snap-y snap-mandatory flex-col gap-6 overflow-y-auto scroll-smooth"
      >
        {/* Espaciador inicial -- sin esto el primer nivel no podria llegar nunca al centro
            del contenedor (no hay nada arriba para "comer" con el scroll). */}
        <div aria-hidden className="h-1/2 shrink-0" />
        {niveles.map((lista, profundidad) => {
          const esActivo = profundidad === niveles.length - 1
          return (
            <div
              key={profundidad}
              ref={(el) => {
                nivelRefs.current[profundidad] = el
              }}
              className="shrink-0 snap-center snap-always rounded-xl p-1 transition-[filter,opacity,transform] duration-150 ease-out"
            >
              <RadioGroup
                // "" (nunca "undefined") desde el primer render -- ningun RadioGroupItem usa
                // ese valor (son indices stringificados, 0 en adelante), asi que sirve de
                // sentinela de "nada elegido todavia" sin que el componente pase de
                // no controlado a controlado (ese cambio a mitad de vida es lo que Base UI
                // warneaba).
                value={caminoIndices[profundidad] !== undefined ? String(caminoIndices[profundidad]) : ""}
                onValueChange={(valor) => elegir(profundidad, Number(valor))}
                className="gap-2"
              >
                {lista.map((item, indice) => {
                  const Icono = item.icon
                  const id = `drillmenu-${profundidad}-${indice}`
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors sm:p-4",
                        esActivo ? "bg-background shadow-sm hover:bg-accent" : "bg-muted/40"
                      )}
                    >
                      <RadioGroupItem value={String(indice)} id={id} />
                      <Icono className="size-5 shrink-0 text-muted-foreground" />
                      <Label htmlFor={id} className="flex-1 flex-col items-start gap-0.5 cursor-pointer">
                        <span className="font-medium">{item.label}</span>
                        {item.descripcion && <span className="text-xs text-muted-foreground">{item.descripcion}</span>}
                      </Label>
                      {item.submenu && <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />}
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )
        })}
        {/* Espaciador final -- simetrico al de arriba, para que el ultimo nivel tambien
            pueda llegar al centro. */}
        <div aria-hidden className="h-1/2 shrink-0" />
      </div>
    </div>
  )
}

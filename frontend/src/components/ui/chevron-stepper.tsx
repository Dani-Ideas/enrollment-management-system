import { useRef } from "react"
import type { CSSProperties } from "react"

// Indicador de pasos en forma de chevron, pegados unos a otros (mismo clip-path que el
// ejemplo original de ReUI). CERO dependencias de npm aparte de React -- portable a
// cualquier proyecto React + Tailwind copiando este solo archivo.
//
// Por defecto usa los tokens de color estandar de shadcn/ui (--primary, --primary-foreground,
// --input, --border, --card, --radius-sm) -- si tu proyecto ya usa shadcn/ui, funciona sin
// tocar nada. Si no (o si quieres otros colores), pasa `colors` con cualquier valor CSS
// valido (nombre, hex, oklch(), var(--lo-que-sea)...) -- no tienen que ser clases de
// Tailwind, por eso quedan configurables de verdad en tiempo de ejecucion.

// Concat de clases sin dependencias (no deduplica clases en conflicto, como si haria
// tailwind-merge -- aca nunca se pasan dos valores para la misma propiedad).
function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ")
}

type EstadoPaso = "active" | "completed" | "inactive"

export interface ChevronStepperColors {
  /** Fondo del paso activo. Default: "var(--primary)" */
  active?: string
  /** Texto del paso activo. Default: "var(--primary-foreground)" */
  activeText?: string
  /** Color base para completado/pendiente/hover -- cada uno usa una opacidad distinta
   *  sobre este mismo color (40/50/60%), igual que el diseño original. Default: "var(--input)" */
  base?: string
}

export interface ChevronStepperProps {
  /** Titulo de cada paso, en orden. El largo del array define cuantos pasos hay. */
  steps: string[]
  /** Indice (0-based) del paso actual. */
  current: number
  /** Indice (0-based) del paso mas lejano ya desbloqueado -- por defecto, "current" (ningun paso bloqueado por delante). */
  maxStep?: number
  /** Se llama con el indice (0-based) del paso clickeado/enfocado+Enter -- nunca con un indice bloqueado. */
  onStepChange: (indice: number) => void
  /** Cualquier campo que omitas usa su default (ver ChevronStepperColors). */
  colors?: ChevronStepperColors
  /** Un color por paso (cualquier valor CSS valido), para pintar cada chevron distinto --
   *  si hay menos colores que pasos, se repiten en ciclo (indice % palette.length). Tiñe
   *  pendiente/completado; el paso ACTIVO sigue usando "colors.active" siempre, para que
   *  nunca sea ambiguo cual es el actual. */
  palette?: string[]
  /** Clase extra para el contenedor raiz (ej. "mb-4"). */
  className?: string
}

export function ChevronStepper({ steps, current, maxStep, onStepChange, colors, palette, className }: ChevronStepperProps) {
  const limite = maxStep ?? current
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([])

  // Variables CSS, no clases de Tailwind -- por eso se pueden configurar de verdad en
  // runtime (un valor que solo existe como prop en tiempo de ejecucion jamas generaria CSS
  // si lo armaramos como clase de Tailwind).
  const vars = {
    "--chevron-active": colors?.active ?? "var(--primary)",
    "--chevron-active-fg": colors?.activeText ?? "var(--primary-foreground)",
    "--chevron-base": colors?.base ?? "var(--input)",
  } as CSSProperties

  // Flechas izq/der mueven el foco entre pasos (role="tab" lo espera) -- Home/End van al
  // primero/ultimo. Solo mueve el foco, nunca selecciona ni salta bloqueos.
  function alPresionarTecla(evento: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const enfocar = (destino: number) => botonesRef.current[destino]?.focus()
    if (evento.key === "ArrowRight") {
      evento.preventDefault()
      enfocar((indice + 1) % steps.length)
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault()
      enfocar((indice - 1 + steps.length) % steps.length)
    } else if (evento.key === "Home") {
      evento.preventDefault()
      enfocar(0)
    } else if (evento.key === "End") {
      evento.preventDefault()
      enfocar(steps.length - 1)
    }
  }

  return (
    <div style={vars} className={cn("relative -m-1 overflow-x-auto p-1", className)}>
      <div role="tablist" aria-label="Pasos" className="flex min-w-max">
        {steps.map((titulo, indice) => {
          const bloqueado = indice > limite
          const estado: EstadoPaso = indice < current ? "completed" : indice === current ? "active" : "inactive"
          const colorPaso = palette?.[indice % palette.length]

          return (
            <div
              key={indice}
              style={colorPaso ? ({ "--chevron-step": colorPaso } as CSSProperties) : undefined}
              className={cn(
                "group/step pointer-events-none not-last:flex-none has-focus-visible:z-10",
                "has-focus-visible:[filter:drop-shadow(1.5px_0_var(--color-ring))_drop-shadow(-1.5px_0_var(--color-ring))_drop-shadow(0_1.5px_var(--color-ring))_drop-shadow(0_-1.5px_var(--color-ring))]",
              )}
            >
              <button
                ref={(el) => {
                  botonesRef.current[indice] = el
                }}
                type="button"
                role="tab"
                aria-selected={estado === "active"}
                disabled={bloqueado}
                data-state={estado}
                tabIndex={estado === "active" ? 0 : -1}
                onClick={() => onStepChange(indice)}
                onKeyDown={(e) => alPresionarTecla(e, indice)}
                className={cn(
                  // Chevron: flecha de 16px al final, muesca de 16px al inicio, solapando
                  // el anterior 14px.
                  "relative isolate bg-background after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] -ms-3.5 rounded-none",
                  "[--arrow:--spacing(4)] [--notch:--spacing(4)]",
                  "group-first/step:ms-0 group-first/step:rounded-s-[calc(var(--radius-sm)-2px)] group-first/step:[--notch:0px]",
                  "group-last/step:rounded-e-[calc(var(--radius-sm)-2px)] group-last/step:[--arrow:0px]",
                  "[clip-path:polygon(calc(var(--notch)*0.167)_0,calc(100%_-_var(--arrow)*1.113)_0,calc(100%_-_var(--arrow)*1.01)_0.98%,calc(100%_-_var(--arrow)*0.926)_3.73%,calc(100%_-_var(--arrow)*0.148)_42.62%,calc(100%_-_var(--arrow)*0.092)_47.38%,calc(100%_-_var(--arrow)*0.092)_52.62%,calc(100%_-_var(--arrow)*0.148)_57.38%,calc(100%_-_var(--arrow)*0.926)_96.27%,calc(100%_-_var(--arrow)*1.01)_99.02%,calc(100%_-_var(--arrow)*1.113)_100%,calc(var(--notch)*0.167)_100%,calc(var(--notch)*0.111)_94.45%,calc(var(--notch)*0.852)_57.38%,calc(var(--notch)*0.908)_52.62%,calc(var(--notch)*0.908)_47.38%,calc(var(--notch)*0.852)_42.62%,calc(var(--notch)*0.111)_5.55%)]",
                  "rtl:[clip-path:polygon(calc(100%_-_var(--notch)*0.167)_0,calc(var(--arrow)*1.113)_0,calc(var(--arrow)*1.01)_0.98%,calc(var(--arrow)*0.926)_3.73%,calc(var(--arrow)*0.148)_42.62%,calc(var(--arrow)*0.092)_47.38%,calc(var(--arrow)*0.092)_52.62%,calc(var(--arrow)*0.148)_57.38%,calc(var(--arrow)*0.926)_96.27%,calc(var(--arrow)*1.01)_99.02%,calc(var(--arrow)*1.113)_100%,calc(100%_-_var(--notch)*0.167)_100%,calc(100%_-_var(--notch)*0.111)_94.45%,calc(100%_-_var(--notch)*0.852)_57.38%,calc(100%_-_var(--notch)*0.908)_52.62%,calc(100%_-_var(--notch)*0.908)_47.38%,calc(100%_-_var(--notch)*0.852)_42.62%,calc(100%_-_var(--notch)*0.111)_5.55%)]",
                  // Layout + colores -- "bg-(--var)" es la sintaxis de Tailwind v4 para
                  // "bg-[var(--var)]": la clase es ESTATICA (Tailwind la ve en el codigo
                  // fuente, la genera sin problema), el VALOR real lo resuelve el navegador
                  // leyendo la variable CSS que "vars" puso en el contenedor raiz.
                  "focus-visible:outline-none",
                  "pointer-events-auto inline-flex h-9 cursor-pointer items-center gap-1.5 ps-6.5 pe-6",
                  "group-first/step:ps-3 group-last/step:pe-3",
                  "after:bg-[var(--chevron-step,var(--chevron-base))]/40",
                  "hover:not-data-[state=active]:after:bg-[var(--chevron-step,var(--chevron-base))]/60",
                  "data-[state=completed]:after:bg-[var(--chevron-step,var(--chevron-base))]/50",
                  "data-[state=active]:text-(--chevron-active-fg) data-[state=active]:after:bg-(--chevron-active)",
                  "disabled:pointer-events-none disabled:opacity-60",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative isolate inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[min(var(--radius-md),calc(var(--spacing-5)/3))]",
                    "border border-border bg-muted/50 p-0.5 text-xs leading-none font-medium",
                    "after:absolute after:-z-10 after:inset-0.5 after:rounded-[calc(min(var(--radius-md),calc(var(--spacing-5)/3))-2px)] after:border after:border-border after:bg-card after:shadow-xs",
                    estado === "completed" && "bg-input/60",
                    estado === "active" && "bg-white/20 text-(--chevron-active) after:border-(--chevron-active) after:bg-white",
                  )}
                >
                  {indice + 1}
                </span>
                <span className="whitespace-nowrap text-sm font-medium">{titulo}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

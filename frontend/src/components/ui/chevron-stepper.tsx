import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Spinner } from "@/components/ui/spinner"


function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ")
}

type EstadoPaso = "active" | "completed" | "inactive"

export interface ChevronStepperColors {
  active?: string
  activeText?: string
  base?: string
}

export interface ChevronStepperProps {
  steps: string[]
  current: number
  maxStep?: number
  onStepChange: (indice: number) => void
  colors?: ChevronStepperColors
  palette?: string[]
  pasoEnCurso?: number | null
  bloqueadoGlobalmente?: boolean
  className?: string
}

export function ChevronStepper({
  steps,
  current,
  maxStep,
  onStepChange,
  colors,
  palette,
  pasoEnCurso,
  bloqueadoGlobalmente = false,
  className,
}: ChevronStepperProps) {
  const limite = maxStep ?? current
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([])

  const limiteAnteriorRef = useRef(limite)
  const [pasoRecienDesbloqueado, setPasoRecienDesbloqueado] = useState<number | null>(null)

  useEffect(() => {
    if (limite > limiteAnteriorRef.current) {
      setPasoRecienDesbloqueado(limite)
      const id = setTimeout(() => setPasoRecienDesbloqueado(null), 550)
      limiteAnteriorRef.current = limite
      return () => clearTimeout(id)
    }
    limiteAnteriorRef.current = limite
  }, [limite])

  const vars = {
    "--chevron-active": colors?.active ?? "var(--primary)",
    "--chevron-active-fg": colors?.activeText ?? "var(--primary-foreground)",
    "--chevron-base": colors?.base ?? "var(--input)",
  } as CSSProperties

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
      <style>{`
        @keyframes chevron-stepper-desbloqueo {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
      `}</style>
      <div role="tablist" aria-label="Pasos" className="flex min-w-max">
        {steps.map((titulo, indice) => {
          const bloqueado = bloqueadoGlobalmente || indice > limite
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
                  "relative isolate bg-background after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] -ms-3.5 rounded-none",
                  indice === pasoRecienDesbloqueado &&
                    "z-20 [animation:chevron-stepper-desbloqueo_550ms_ease-in-out]",
                  "[--arrow:--spacing(4)] [--notch:--spacing(4)]",
                  "group-first/step:ms-0 group-first/step:rounded-s-[calc(var(--radius-sm)-2px)] group-first/step:[--notch:0px]",
                  "group-last/step:rounded-e-[calc(var(--radius-sm)-2px)] group-last/step:[--arrow:0px]",
                  "[clip-path:polygon(calc(var(--notch)*0.167)_0,calc(100%_-_var(--arrow)*1.113)_0,calc(100%_-_var(--arrow)*1.01)_0.98%,calc(100%_-_var(--arrow)*0.926)_3.73%,calc(100%_-_var(--arrow)*0.148)_42.62%,calc(100%_-_var(--arrow)*0.092)_47.38%,calc(100%_-_var(--arrow)*0.092)_52.62%,calc(100%_-_var(--arrow)*0.148)_57.38%,calc(100%_-_var(--arrow)*0.926)_96.27%,calc(100%_-_var(--arrow)*1.01)_99.02%,calc(100%_-_var(--arrow)*1.113)_100%,calc(var(--notch)*0.167)_100%,calc(var(--notch)*0.111)_94.45%,calc(var(--notch)*0.852)_57.38%,calc(var(--notch)*0.908)_52.62%,calc(var(--notch)*0.908)_47.38%,calc(var(--notch)*0.852)_42.62%,calc(var(--notch)*0.111)_5.55%)]",
                  "rtl:[clip-path:polygon(calc(100%_-_var(--notch)*0.167)_0,calc(var(--arrow)*1.113)_0,calc(var(--arrow)*1.01)_0.98%,calc(var(--arrow)*0.926)_3.73%,calc(var(--arrow)*0.148)_42.62%,calc(var(--arrow)*0.092)_47.38%,calc(var(--arrow)*0.092)_52.62%,calc(var(--arrow)*0.148)_57.38%,calc(var(--arrow)*0.926)_96.27%,calc(var(--arrow)*1.01)_99.02%,calc(var(--arrow)*1.113)_100%,calc(100%_-_var(--notch)*0.167)_100%,calc(100%_-_var(--notch)*0.111)_94.45%,calc(100%_-_var(--notch)*0.852)_57.38%,calc(100%_-_var(--notch)*0.908)_52.62%,calc(100%_-_var(--notch)*0.908)_47.38%,calc(100%_-_var(--notch)*0.852)_42.62%,calc(100%_-_var(--notch)*0.111)_5.55%)]",
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
                  {indice === pasoEnCurso ? <Spinner className="size-3" /> : indice + 1}
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

import { IconTile } from "@/components/reui/icon-tile"
import { Stepper, StepperItem, StepperNav, StepperTitle, StepperTrigger } from "@/components/reui/stepper"
import { cn } from "@/lib/utils"
import type { Accion } from "./types"
import { etiquetaPaso, totalPasos } from "./types"

// Indicador de pasos (arriba del Carousel) -- clickeable solo hasta "maxStep" (el paso mas
// lejano ya desbloqueado). Idéntico entre FormularioPagoPage.tanstack.tsx e
// InscripcionWizard.tanstack.tsx, salvo que este ultimo tiene un paso mas ("lista").
//
// Stepper (ReUI) es 1-indexado (step/value arrancan en 1); current/maxStep/onIrAPaso de
// useInscripcionForm son 0-indexados (Embla scrollTo). La conversion +1/-1 es a proposito,
// no un desface -- queda aislada aca, el resto del wizard no sabe que Stepper existe.

// Cada trigger se recorta a un chevron: una flecha de 16px al final y una muesca de 16px al
// inicio, solapando el anterior 14px (mismo truco que el ejemplo original de ReUI -- el
// clip-path no cambia, solo el color: aca "active" usa los tokens del tema, bg-primary/
// text-primary-foreground, en vez del blue-500 fijo del demo original).
const chevron =
  "relative isolate bg-background after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] -ms-3.5 rounded-none [--arrow:--spacing(4)] [--notch:--spacing(4)] group-first/step:ms-0 group-first/step:rounded-s-[calc(var(--radius-sm)-2px)] group-first/step:[--notch:0px] group-last/step:rounded-e-[calc(var(--radius-sm)-2px)] group-last/step:[--arrow:0px] [clip-path:polygon(calc(var(--notch)*0.167)_0,calc(100%_-_var(--arrow)*1.113)_0,calc(100%_-_var(--arrow)*1.01)_0.98%,calc(100%_-_var(--arrow)*0.926)_3.73%,calc(100%_-_var(--arrow)*0.148)_42.62%,calc(100%_-_var(--arrow)*0.092)_47.38%,calc(100%_-_var(--arrow)*0.092)_52.62%,calc(100%_-_var(--arrow)*0.148)_57.38%,calc(100%_-_var(--arrow)*0.926)_96.27%,calc(100%_-_var(--arrow)*1.01)_99.02%,calc(100%_-_var(--arrow)*1.113)_100%,calc(var(--notch)*0.167)_100%,calc(var(--notch)*0.111)_94.45%,calc(var(--notch)*0.852)_57.38%,calc(var(--notch)*0.908)_52.62%,calc(var(--notch)*0.908)_47.38%,calc(var(--notch)*0.852)_42.62%,calc(var(--notch)*0.111)_5.55%)] rtl:[clip-path:polygon(calc(100%_-_var(--notch)*0.167)_0,calc(var(--arrow)*1.113)_0,calc(var(--arrow)*1.01)_0.98%,calc(var(--arrow)*0.926)_3.73%,calc(var(--arrow)*0.148)_42.62%,calc(var(--arrow)*0.092)_47.38%,calc(var(--arrow)*0.092)_52.62%,calc(var(--arrow)*0.148)_57.38%,calc(var(--arrow)*0.926)_96.27%,calc(var(--arrow)*1.01)_99.02%,calc(var(--arrow)*1.113)_100%,calc(100%_-_var(--notch)*0.167)_100%,calc(100%_-_var(--notch)*0.111)_94.45%,calc(100%_-_var(--notch)*0.852)_57.38%,calc(100%_-_var(--notch)*0.908)_52.62%,calc(100%_-_var(--notch)*0.908)_47.38%,calc(100%_-_var(--notch)*0.852)_42.62%,calc(100%_-_var(--notch)*0.111)_5.55%)]"

export function PasosNavegacion({
  accion,
  current,
  maxStep,
  onIrAPaso,
}: {
  accion: Accion | null
  current: number
  maxStep: number
  onIrAPaso: (indice: number) => void
}) {
  const pasos = Array.from({ length: totalPasos(accion) }, (_, i) => etiquetaPaso(accion, i))

  return (
    <Stepper value={current + 1} onValueChange={(paso) => onIrAPaso(paso - 1)} className="mb-4">
      <div className="relative -m-1 overflow-x-auto p-1">
        <StepperNav className="flex min-w-max">
          {pasos.map((titulo, indice) => {
            const paso = indice + 1
            return (
              <StepperItem
                key={indice}
                step={paso}
                disabled={indice > maxStep}
                className="pointer-events-none not-last:flex-none has-focus-visible:z-10 has-focus-visible:[filter:drop-shadow(1.5px_0_var(--color-ring))_drop-shadow(-1.5px_0_var(--color-ring))_drop-shadow(0_1.5px_var(--color-ring))_drop-shadow(0_-1.5px_var(--color-ring))]"
              >
                <StepperTrigger
                  className={cn(
                    chevron,
                    "after:bg-input/40 not-data-[state=active]:hover:after:bg-input/60 data-[state=completed]:after:bg-input/50 pointer-events-auto h-9 gap-1.5 ps-6.5 pe-6 group-first/step:ps-3 group-last/step:pe-3 data-[state=active]:text-primary-foreground data-[state=active]:after:bg-primary",
                  )}
                >
                  <IconTile
                    variant="frame"
                    size="xs"
                    aria-hidden="true"
                    className="bg-input/30 group-data-[state=completed]/step:bg-input/60 after:border-ring/30 overflow-hidden border-0 text-xs leading-none font-medium [--icon-tile-size:--spacing(5)] group-data-[state=active]/step:bg-white/20 group-data-[state=active]/step:text-primary after:border-[0.5px] after:shadow-sm group-data-[state=active]/step:after:border-primary group-data-[state=active]/step:after:bg-white"
                  >
                    {paso}
                  </IconTile>
                  <StepperTitle className="whitespace-nowrap">{titulo}</StepperTitle>
                </StepperTrigger>
              </StepperItem>
            )
          })}
        </StepperNav>
      </div>
    </Stepper>
  )
}

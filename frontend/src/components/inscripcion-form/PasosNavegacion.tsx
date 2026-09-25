import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import type { Accion } from "./types"
import { etiquetaPaso, totalPasos } from "./types"

// Indicador de pasos (arriba del Carousel) -- clickeable solo hasta
// "maxStep" (el paso mas lejano ya desbloqueado). Idéntico entre
// FormularioPagoPage.tanstack.tsx e InscripcionWizard.tanstack.tsx, salvo
// que este ultimo tiene un paso mas ("lista").
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
    <NavigationMenu viewport={false} className="mb-4 max-w-none justify-start">
      <NavigationMenuList className="flex-wrap justify-start gap-1">
        {pasos.map((titulo, indice) => {
          const desbloqueado = indice <= maxStep
          const esActual = indice === current
          return (
            <NavigationMenuItem key={indice}>
              <button
                type="button"
                disabled={!desbloqueado}
                onClick={() => onIrAPaso(indice)}
                className={cn(
                  navigationMenuTriggerStyle(),
                  esActual && "bg-muted font-semibold text-foreground",
                  !desbloqueado && "cursor-not-allowed opacity-40",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-xs",
                    esActual ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {indice + 1}
                </span>
                {titulo}
              </button>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

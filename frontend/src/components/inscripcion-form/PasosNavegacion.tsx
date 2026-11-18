import { ChevronStepper } from "@/components/ui/chevron-stepper"
import type { Accion } from "./types"
import { etiquetaPaso, totalPasos } from "./types"

// Indicador de pasos (arriba del Carousel) -- clickeable solo hasta "maxStep" (el paso mas
// lejano ya desbloqueado). Idéntico entre FormularioPagoPage.tanstack.tsx e
// InscripcionWizard.tanstack.tsx, salvo que este ultimo tiene un paso mas ("lista").
//
// El chevron en si (ChevronStepper) no sabe nada de "inscripciones" -- este componente solo
// traduce accion/current/maxStep/onIrAPaso (el vocabulario de este wizard) a steps/current/
// maxStep/onStepChange (el vocabulario generico del Stepper).
export function PasosNavegacion({
  accion,
  current,
  maxStep,
  onIrAPaso,
  pasoEnCurso,
  bloqueadoGlobalmente,
}: {
  accion: Accion | null
  current: number
  maxStep: number
  onIrAPaso: (indice: number) => void
  // Mientras se espera la confirmacion del back de la cadena completa (ver
  // useInscripcionForm.cadenaDiplomasMutation): ese paso muestra un Spinner y NADA es
  // clickeable hasta que resuelva.
  pasoEnCurso?: number | null
  bloqueadoGlobalmente?: boolean
}) {
  const pasos = Array.from({ length: totalPasos(accion) }, (_, i) => etiquetaPaso(accion, i))

  return (
    <ChevronStepper
      steps={pasos}
      current={current}
      maxStep={maxStep}
      onStepChange={onIrAPaso}
      pasoEnCurso={pasoEnCurso}
      bloqueadoGlobalmente={bloqueadoGlobalmente}
      className="mb-4"
      palette={["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"]}
    />
  )
}

import { ChevronStepper } from "@/components/ui/chevron-stepper"
import type { Accion } from "./types"
import { etiquetaPaso, totalPasos } from "./types"

// 📌 PASOS DINAMICOS -- ARCHIVO COMPLETO: el stepper sale de totalPasos/etiquetaPaso.
export function PasosNavegacion({
  accion,
  conPaneles,
  current,
  maxStep,
  onIrAPaso,
  pasoEnCurso,
  bloqueadoGlobalmente,
}: {
  accion: Accion | null
  conPaneles: boolean
  current: number
  maxStep: number
  onIrAPaso: (indice: number) => void
  pasoEnCurso?: number | null
  bloqueadoGlobalmente?: boolean
}) {
  const pasos = Array.from({ length: totalPasos(accion, conPaneles) }, (_, i) =>
    etiquetaPaso(accion, i, conPaneles),
  )

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

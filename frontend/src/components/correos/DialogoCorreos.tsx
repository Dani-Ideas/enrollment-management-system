import { useState } from "react"
import { MailIcon, SendIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import type { CorreoPropuesto } from "./correos"

// La ventana que se abre en los pasos de confirmación: muestra lo que el sistema mandaría
// ANTES de mandarlo, deja desmarcar lo que no corresponda, y recién entonces despacha.
//
// El envío es SIMULADO (ver correos.ts): no sale ninguna petición. Por eso el diálogo lo
// dice en pantalla en vez de disimularlo -- que el usuario crea que mandó un correo que no
// se mandó es peor que no tener la función.
export function DialogoCorreos({
  abierto,
  onAbiertoChange,
  titulo,
  correos,
}: {
  abierto: boolean
  onAbiertoChange: (abierto: boolean) => void
  titulo: string
  correos: CorreoPropuesto[]
}) {
  const [excluidos, setExcluidos] = useState<string[]>([])
  const [despachados, setDespachados] = useState<string[]>([])

  const incluidos = correos.filter((c) => !excluidos.includes(c.id))

  function alternar(id: string) {
    setExcluidos((anteriores) =>
      anteriores.includes(id) ? anteriores.filter((x) => x !== id) : [...anteriores, id],
    )
  }

  function despachar() {
    setDespachados(incluidos.map((c) => c.id))
    toast.add({
      type: "success",
      title: `${incluidos.length} correo${incluidos.length === 1 ? "" : "s"} en la cola`,
      description: "Simulado: el sistema todavía no tiene servicio de correo.",
    })
    onAbiertoChange(false)
  }

  return (
    <AlertDialog open={abierto} onOpenChange={onAbiertoChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MailIcon className="size-4 text-primary" />
            {titulo}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esto es lo que el sistema enviaría. Revisalo y destildá lo que no corresponda.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto">
          {correos.map((correo) => {
            const incluido = !excluidos.includes(correo.id)
            const yaSalio = despachados.includes(correo.id)
            return (
              <div
                key={correo.id}
                className={cn(
                  "space-y-2 rounded-lg border p-3 transition-opacity",
                  incluido ? "bg-card" : "bg-muted/40 opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{correo.motivo}</p>
                    <p className="truncate text-sm font-medium">{correo.asunto}</p>
                  </div>
                  <Switch
                    checked={incluido}
                    onCheckedChange={() => alternar(correo.id)}
                    aria-label={`Incluir: ${correo.asunto}`}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {correo.para.map((d) => (
                    <span
                      key={d.correo}
                      title={`${d.nombre} — ${d.rol}`}
                      className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {d.correo}
                    </span>
                  ))}
                </div>

                <pre className="max-h-32 overflow-y-auto rounded-md bg-muted/40 p-2 text-xs whitespace-pre-wrap">
                  {correo.cuerpo}
                </pre>

                {yaSalio && <p className="text-xs text-ciclo-aprobado">Despachado (simulado).</p>}
              </div>
            )
          })}
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          Envío simulado: no hay servicio de correo detrás. Nada sale de esta pantalla.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel>Ahora no</AlertDialogCancel>
          <Button onClick={despachar} disabled={incluidos.length === 0}>
            <SendIcon />
            Enviar {incluidos.length} correo{incluidos.length === 1 ? "" : "s"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

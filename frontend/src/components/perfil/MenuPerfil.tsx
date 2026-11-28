import { useState } from "react"
import { CheckIcon, UserRoundIcon } from "lucide-react"
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
import { usePerfil } from "./contextoPerfil"
import { PERFILES } from "./perfiles"

// La ficha de usuario de la barra de arriba. Abre un diálogo para cambiar de perfil, en
// lugar de un menú flotante: no hay componente de dropdown en components/ui y un diálogo
// no necesita manejo de clic-afuera ni de foco propio.
export function MenuPerfil() {
  const { perfil, cambiarPerfil } = usePerfil()
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Cambiar de perfil (ficticio)"
        className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {perfil.iniciales}
        </span>
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block truncate text-xs font-medium">{perfil.nombre}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{perfil.rol}</span>
        </span>
      </button>

      <AlertDialog open={abierto} onOpenChange={setAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar de perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Perfiles de demostración: el sistema todavía no tiene login, así que esto solo
              cambia con qué nombre y rol se arma la pantalla.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            {PERFILES.map((p) => {
              const activo = p.id === perfil.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    cambiarPerfil(p.id)
                    setAbierto(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                    activo ? "border-primary/40 bg-primary/5" : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {p.iniciales}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.nombre}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.rol} · {p.correo}
                    </span>
                  </span>
                  {p.firma && (
                    <span className="shrink-0 rounded-md border border-dashed px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      firma
                    </span>
                  )}
                  {activo && <CheckIcon className="size-4 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <UserRoundIcon />
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { cn } from "cn"

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      orientation={orientation}
      className={cn("flex h-full w-full", orientation === "vertical" && "flex-col", className)}
      {...props}
    />
  )
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" className={cn("min-h-0 min-w-0", className)} {...props} />
}

// El "group" (clase, no el Group del carousel) es lo que permite que el icono de agarre de
// adentro lea la orientacion -- Separator pone aria-orientation en si mismo segun el Group
// padre, pero no lo propaga a sus hijos, asi que el grip usa group-aria-[orientation=...]
// para leerlo igual.
//
// OJO: aria-orientation describe la LINEA del separador, no la orientacion del Group --
// un Group horizontal (paneles lado a lado) tiene una linea VERTICAL entre ellos, por eso
// ahi aria-orientation="vertical" (confirmado corriendo esto: lo tenia al reves y el handle
// se estiraba al 100% del ancho). Las clases base (sin variante) son esa linea vertical, y
// la variante aria-[orientation=horizontal] la rota para un Group vertical.
function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-px items-center justify-center bg-border transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 data-[separator=active]:bg-ring",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border group-aria-[orientation=horizontal]:h-3 group-aria-[orientation=horizontal]:w-4 group-aria-[orientation=horizontal]:rotate-90">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

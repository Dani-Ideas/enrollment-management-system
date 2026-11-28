import type { ReactNode } from "react"
import { cn } from "cn"
import { CLASES_CICLO, type TonoCiclo } from "./ciclo"

export function BadgeCiclo({
  tono,
  children,
  className,
}: {
  tono: TonoCiclo
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        CLASES_CICLO[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}

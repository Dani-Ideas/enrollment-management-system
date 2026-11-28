import { useState, type FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

// El buscador de la barra superior del ejemplo, pero haciendo algo real: un número entra
// directo al panel de esa solicitud, y cualquier otro texto cae en el tablero filtrado
// (?q=). No es un command palette: no hay nada mas que buscar hoy que solicitudes.
export function BuscadorGlobal() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState("")

  function buscar(evento: FormEvent) {
    evento.preventDefault()
    const valor = texto.trim()
    if (valor === "") return

    const id = Number(valor)
    if (Number.isInteger(id) && id > 0) {
      navigate({ to: "/solicitud/$id", params: { id: String(id) } })
      return
    }
    navigate({ to: "/solicitudes", search: { q: valor } })
  }

  return (
    <form onSubmit={buscar} className="relative min-w-0 flex-1 sm:max-w-sm">
      <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar por id, proyecto o versión…"
        aria-label="Buscar solicitudes"
        className="h-8 pl-8 text-sm"
      />
    </form>
  )
}

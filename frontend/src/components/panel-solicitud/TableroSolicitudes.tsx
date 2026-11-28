import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { solicitudesRoute } from "@/router"
import { useQuery } from "@tanstack/react-query"
import { ChevronRightIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"
import { CATALOGOS_INSCRIPCION_QUERY, fetchSolicitudes } from "@/api/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { BadgeCiclo } from "./BadgeCiclo"
import { tonoDeEstado } from "./ciclo"

function Tile({ etiqueta, valor, acento = false }: { etiqueta: string; valor: number; acento?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", acento ? "border-primary/30 bg-primary/5" : "bg-muted/30")}>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="text-xl font-semibold tracking-titulo">{valor}</p>
    </div>
  )
}

// Tablero de TODAS las solicitudes: las fichas de arriba y la lista filtrable de abajo.
// Comparte la queryKey ["solicitudes"] con el wizard y con el panel, asi que moverse entre
// las tres pantallas no vuelve a pedir la lista.
export function TableroSolicitudes() {
  const catalogosQuery = useQuery(CATALOGOS_INSCRIPCION_QUERY)
  const solicitudesQuery = useQuery({
    queryKey: ["solicitudes"],
    queryFn: fetchSolicitudes,
    staleTime: 10 * 1000,
  })

  // El buscador de la barra superior deja el texto en la URL; este es su valor inicial.
  const { q } = solicitudesRoute.useSearch()
  const [texto, setTexto] = useState(q ?? "")
  const [etapa, setEtapa] = useState("")
  const [estado, setEstado] = useState("")
  const [ambiente, setAmbiente] = useState("")

  const todas = solicitudesQuery.data ?? []
  const busqueda = texto.trim().toLowerCase()
  const visibles = todas.filter(
    (s) =>
      (etapa === "" || s.etapa === etapa) &&
      (estado === "" || s.estado === estado) &&
      (ambiente === "" || s.ambiente === ambiente) &&
      (busqueda === "" ||
        s.proyecto.toLowerCase().includes(busqueda) ||
        s.version.toLowerCase().includes(busqueda) ||
        String(s.id) === busqueda),
  )

  const etapas = [...new Set(todas.map((s) => s.etapa))]
  const cuenta = (nombre: string) => todas.filter((s) => s.etapa === nombre).length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Tile etiqueta="Solicitudes" valor={todas.length} acento />
        <Tile etiqueta="Primaria" valor={cuenta("Primaria")} />
        <Tile etiqueta="Secundaria" valor={cuenta("Secundaria")} />
        <Tile etiqueta="Universidad" valor={cuenta("Universidad")} />
      </div>

      <Card className="gap-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Solicitudes registradas</h3>
          <span className="text-xs text-muted-foreground">
            {visibles.length} de {todas.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Proyecto, versión o id…"
              className="pl-8"
            />
          </div>
          <NativeSelect value={etapa} onChange={(e) => setEtapa(e.target.value)}>
            <option value="">Todas las etapas</option>
            {etapas.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {catalogosQuery.data?.estados.map((e) => (
              <option key={e.id} value={e.estado}>
                {e.estado}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect value={ambiente} onChange={(e) => setAmbiente(e.target.value)}>
            <option value="">Todos los ambientes</option>
            {catalogosQuery.data?.ambientes.map((a) => (
              <option key={a.id} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </NativeSelect>
        </div>

        {solicitudesQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Cargando solicitudes…
          </p>
        )}

        {!solicitudesQuery.isLoading && visibles.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {todas.length === 0
              ? "Todavía no hay solicitudes registradas."
              : "Ninguna solicitud coincide con esos filtros."}
          </p>
        )}

        <ul className="divide-y rounded-lg border">
          {visibles.map((s) => (
            <li key={s.id}>
              <Link
                to="/solicitud/$id"
                params={{ id: String(s.id) }}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
              >
                <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">#{s.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.proyecto}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.version} · {s.sistema} · {s.ambiente}
                  </p>
                </div>
                <BadgeCiclo tono="borrador" className="hidden sm:inline-flex">
                  {s.etapa}
                </BadgeCiclo>
                <BadgeCiclo tono={tonoDeEstado(s.estado)}>{s.estado}</BadgeCiclo>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

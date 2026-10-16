import { useState } from "react"
import type { InscripcionDTO } from "@/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { NativeSelect } from "@/components/ui/native-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { SearchIcon, TriangleAlertIcon } from "lucide-react"
import { DetalleInscripcion } from "./DetalleInscripcion"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
}

export interface CampoSelectFiltros {
  filtroEstadoId: string
  onCambiarFiltroEstadoId: (valor: string) => void
  filtroSistemaId: string
  onCambiarFiltroSistemaId: (valor: string) => void
  filtroAmbienteId: string
  onCambiarFiltroAmbienteId: (valor: string) => void
  estadosQuery: Catalogo
  sistemasQuery: Catalogo
  ambientesQuery: Catalogo
  cargando: boolean
  error?: Error | null
  hayResultados: boolean
}

// "Encontrar una solicitud existente" -- sin "filtros", es solo busqueda por numero
// exacto (mismo bloque de siempre, usado por "actualizar": elegir cual editar). Con
// "filtros", agrega un toggle y un SEGUNDO modo (estado/sistema/ambiente) -- nunca los
// dos modos juntos, uno tapa al otro (usado por "lista": solo consultar). La lista en si
// que arman esos filtros se renderiza aparte, con CampoVistaDetalle -- aca solo van los
// controles y el loading/error/vacio de esa lista.
export function CampoSelect({
  idPrefix,
  valor,
  onCambiarValor,
  onBuscar,
  buscando,
  hayError,
  resultado,
  filtros,
}: {
  idPrefix: string
  valor: string
  onCambiarValor: (valor: string) => void
  onBuscar: () => void
  buscando: boolean
  hayError: boolean
  resultado?: InscripcionDTO | null
  filtros?: CampoSelectFiltros
}) {
  const [modo, setModo] = useState<"id" | "filtros">("id")

  const campoId = (
    <>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-buscar-id`}>Número de solicitud</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-buscar-id`}
            type="number"
            min="1"
            value={valor}
            onChange={(e) => onCambiarValor(e.target.value)}
            placeholder="Ej. 1"
          />
          <Button onClick={onBuscar} disabled={buscando || valor.trim() === ""}>
            <SearchIcon />
            Buscar
          </Button>
        </div>
      </FieldGroup>

      {hayError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No se encontró esa solicitud</AlertTitle>
          <AlertDescription>Revisá el número e intentá de nuevo.</AlertDescription>
        </Alert>
      )}

      {resultado && (
        <div className="rounded-lg border border-input p-3">
          <DetalleInscripcion inscripcion={resultado} />
        </div>
      )}
    </>
  )

  if (!filtros) {
    return <div className="space-y-3">{campoId}</div>
  }

  const hayFiltroActivo = filtros.filtroEstadoId !== "" || filtros.filtroSistemaId !== "" || filtros.filtroAmbienteId !== ""

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={modo === "id" ? "default" : "outline"} onClick={() => setModo("id")}>
          Buscar por número
        </Button>
        <Button
          type="button"
          size="sm"
          variant={modo === "filtros" ? "default" : "outline"}
          onClick={() => setModo("filtros")}
        >
          Filtrar por categoría
        </Button>
      </div>

      {modo === "id" ? (
        campoId
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor={`${idPrefix}-filtro-estado`}>Estado</FieldLabel>
              <NativeSelect
                id={`${idPrefix}-filtro-estado`}
                value={filtros.filtroEstadoId}
                onChange={(e) => filtros.onCambiarFiltroEstadoId(e.target.value)}
              >
                <option value="">Todos</option>
                {filtros.estadosQuery.data?.map((es) => (
                  <option key={es.id} value={es.id}>
                    {es.estado}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${idPrefix}-filtro-sistema`}>Sistema</FieldLabel>
              <NativeSelect
                id={`${idPrefix}-filtro-sistema`}
                value={filtros.filtroSistemaId}
                onChange={(e) => filtros.onCambiarFiltroSistemaId(e.target.value)}
              >
                <option value="">Todos</option>
                {filtros.sistemasQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${idPrefix}-filtro-ambiente`}>Ambiente</FieldLabel>
              <NativeSelect
                id={`${idPrefix}-filtro-ambiente`}
                value={filtros.filtroAmbienteId}
                onChange={(e) => filtros.onCambiarFiltroAmbienteId(e.target.value)}
              >
                <option value="">Todos</option>
                {filtros.ambientesQuery.data?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          {filtros.cargando && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Cargando…
            </div>
          )}
          {filtros.error && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>No se pudo cargar la lista</AlertTitle>
              <AlertDescription>{filtros.error.message}</AlertDescription>
            </Alert>
          )}
          {!filtros.cargando && !filtros.error && !filtros.hayResultados && (
            <Alert>
              <TriangleAlertIcon />
              <AlertTitle>
                {hayFiltroActivo ? "Ninguna solicitud coincide con esos filtros" : "Todavía no hay solicitudes cargadas"}
              </AlertTitle>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

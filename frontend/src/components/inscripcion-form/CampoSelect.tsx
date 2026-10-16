import { SearchIcon, TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// "Elegir una solicitud existente por numero" -- input + boton Buscar + alerta de no
// encontrada. Mismo bloque que antes vivia duplicado, uno por wizard, en el paso 1 del
// flujo "actualizar" (busqueda por id; la lista para elegir de abajo es aparte, no vive
// aca).
export function CampoSelect({
  idPrefix,
  valor,
  onCambiarValor,
  onBuscar,
  buscando,
  hayError,
}: {
  idPrefix: string
  valor: string
  onCambiarValor: (valor: string) => void
  onBuscar: () => void
  buscando: boolean
  hayError: boolean
}) {
  return (
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
        <FieldDescription>O elegí una directamente de la lista de abajo.</FieldDescription>
      </FieldGroup>

      {hayError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No se encontró esa solicitud</AlertTitle>
          <AlertDescription>Revisá el número e intentá de nuevo.</AlertDescription>
        </Alert>
      )}
    </>
  )
}

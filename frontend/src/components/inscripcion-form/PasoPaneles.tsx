import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AvisoVersionesPanel } from "./AvisoVersionesPanel"
import { BotonesCadena } from "./BotonesCadena"
import { ChecklistEditor } from "./ChecklistEditor"
import { DocumentoPanel } from "./DocumentoPanel"
import { PieNivel } from "./PieNivel"
import { PruebasEditor } from "./PruebasEditor"
import { ResumenVoBo } from "./ResumenVoBo"
import { type ModoPaso, type NivelCadena, NIVEL_SIGUIENTE, pasoDatosDe, pasoPanelesDe } from "./types"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Checklist, pruebas, documentación y aviso de versiones de UN nivel, en cualquiera de los
// 3 modos -- los 4 editores son siempre los mismos, lo que cambia es de donde sale su
// estado (perfilNivel) y que se puede hacer con el:
//  - "crear": se llenan en memoria y viajan con la cadena al "Finalizar y enviar".
//  - "actualizar": se guardan con su propia peticion, por eso el boton y sus avisos.
//  - "consultar": solo lectura.
//
// Este paso existe SOLO en el ambiente principal (ver llevaPaneles en useInscripcionForm):
// en los demas ni siquiera se monta, por eso aca no hay ninguna condicion sobre el ambiente.
export function PasoPaneles({
  wizard,
  nivel,
  modo,
}: {
  wizard: InscripcionFormApi
  nivel: NivelCadena
  modo: ModoPaso
}) {
  const perfil = wizard.perfilNivel(nivel)
  const { estadosQuery, responsablesQuery, tiposPruebaQuery, pasoDe, continuarCadena, enviarCadena, cadenaMutation } =
    wizard

  if (modo !== "crear" && !perfil.existe) return null

  const idPrefix = perfil.idPaneles[modo]
  const soloLectura = modo === "consultar"
  const siguiente = NIVEL_SIGUIENTE[nivel]

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{perfil.etiqueta} -- checklist, pruebas y documentación</h3>
        {modo === "crear" && (
          <p className="text-xs text-muted-foreground">
            Todo es opcional en este paso: podés enviarlo incompleto y completarlo después, o
            seguir con el resto de la cadena.
          </p>
        )}
        <ChecklistEditor
          items={perfil.checklist}
          onAgregar={perfil.checklistAcciones.agregar}
          onCambiar={perfil.checklistAcciones.cambiar}
          onQuitar={perfil.checklistAcciones.quitar}
          estadosQuery={estadosQuery}
          responsablesQuery={responsablesQuery}
          disabled={soloLectura}
        />
        <PruebasEditor
          items={perfil.pruebas}
          onAgregar={perfil.pruebasAcciones.agregar}
          onCambiar={perfil.pruebasAcciones.cambiar}
          onQuitar={perfil.pruebasAcciones.quitar}
          estadosQuery={estadosQuery}
          tiposPruebaQuery={tiposPruebaQuery}
          disabled={soloLectura}
        />
        <DocumentoPanel
          idPrefix={idPrefix}
          valor={perfil.documento}
          onCambiar={perfil.setDocumento}
          disabled={soloLectura}
        />
        <AvisoVersionesPanel
          idPrefix={idPrefix}
          valor={perfil.aviso}
          onCambiar={perfil.setAviso}
          disabled={soloLectura}
        />

        {modo === "crear" && (
          <>
            {/* El VoBo lo calcula el servidor al guardar los paneles: antes de "Finalizar y
                enviar" no hay nada que mostrar todavia. */}
            {perfil.voBo !== null && <ResumenVoBo voBo={perfil.voBo} />}
            <BotonesCadena
              hastaPaso={pasoDe(pasoPanelesDe(nivel))}
              siguientePaso={siguiente === null ? undefined : pasoDe(pasoDatosDe(siguiente))}
              etiquetaSiguiente={`Continuar con ${siguiente}`}
              mutation={cadenaMutation}
              onEnviar={enviarCadena}
              onContinuar={continuarCadena}
            />
          </>
        )}

        {modo === "actualizar" && (
          <>
            {perfil.guardarPanelesMutation.isSuccess && (
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle>Cambios guardados</AlertTitle>
              </Alert>
            )}
            {perfil.guardarPanelesMutation.isError && (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                <AlertDescription>{(perfil.guardarPanelesMutation.error as Error).message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => perfil.guardarPanelesMutation.mutate()}
                disabled={perfil.guardarPanelesMutation.isPending}
                className="w-fit"
              >
                Guardar cambios
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Mirando una cadena ya existente, el VoBo SIEMPRE se muestra (es lo que el servidor
          calculo) y de aca se sigue al nivel que viene, si lo hay. */}
      {modo !== "crear" && (
        <div className="mt-4 space-y-4">
          <ResumenVoBo voBo={perfil.voBo} />
          <PieNivel
            hayPasoSiguiente={perfil.siguienteExiste}
            etiquetaSiguiente={`Ver ${siguiente}`}
            textoSinSiguiente={siguiente === null ? undefined : `Esta solicitud no tiene una ${siguiente} encadenada.`}
            etiquetaSalir={soloLectura ? "Consultar otra solicitud" : "Actualizar otra solicitud"}
            onSiguiente={() => continuarCadena(siguiente === null ? pasoDe(pasoPanelesDe(nivel)) : pasoDe(pasoDatosDe(siguiente)))}
            onSalir={soloLectura ? wizard.consultarOtra : wizard.actualizarOtra}
          />
        </div>
      )}
    </>
  )
}

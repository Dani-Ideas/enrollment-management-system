import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { BotonesCadena } from "./BotonesCadena"
import { CampoCatalogo } from "./CampoCatalogo"
import { CampoDatosProyecto } from "./CampoDatosProyecto"
import { CampoResponsables } from "./CampoResponsables"
import { CampoSelect } from "./CampoSelect"
import { CampoVistaDetalle } from "./CampoVistaDetalle"
import { CamposInscripcionCompletos } from "./CamposInscripcionCompletos"
import { PieNivel } from "./PieNivel"
import { type ModoPaso, type NivelCadena, NIVEL_SIGUIENTE, pasoDatosDe } from "./types"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Los campos de UN nivel de la cadena, en CUALQUIERA de los 3 modos. Antes esto eran 9
// bloques de JSX casi iguales (3 niveles x 3 modos) repartidos por el carrusel; ahora el
// nivel entra por parametro y de el sale todo lo demas (ver perfilNivel en
// useInscripcionForm): que formulario, que ids, si esta completo, si existe en la cadena.
//
// Las 3 diferencias REALES que quedan, y por que:
//  - "crear" de primaria es el primer paso del flujo y ademas ofrece clonar otra solicitud,
//    asi que lleva el bloque del Prototype y el boton va a la Confirmacion.
//  - primaria es el unico nivel con formaciones complementarias, asi que en "actualizar"
//    usa CamposInscripcionCompletos (que las trae) en vez de los 3 campos sueltos.
//  - "crear" cierra con los botones de la cadena; "actualizar"/"consultar", con el pie que
//    decide si se sigue al nivel que viene o se sale.
export function PasoDatos({
  wizard,
  nivel,
  modo,
}: {
  wizard: InscripcionFormApi
  nivel: NivelCadena
  modo: ModoPaso
}) {
  const perfil = wizard.perfilNivel(nivel)
  const {
    estadosQuery,
    sistemasQuery,
    responsablesQuery,
    ambientesQuery,
    llevaPaneles,
    pasoDe,
    trasPaso,
    continuarCadena,
    enviarCadena,
    cadenaMutation,
  } = wizard

  // En "crear" todos los niveles se pueden llenar siempre; mirando una cadena que ya existe,
  // un nivel que no esta encadenado no tiene nada que mostrar. La primaria de "actualizar"
  // es la excepcion: es el paso al que se llega apenas arranca la carga, asi que en vez de
  // no mostrar nada espera al baseline (abajo) con un spinner.
  const esPrimariaActualizar = modo === "actualizar" && nivel === "primaria"
  if (modo !== "crear" && !perfil.existe && !esPrimariaActualizar) return null

  const idPrefix = perfil.idDatos[modo]
  const soloLectura = modo === "consultar"
  const siguiente = NIVEL_SIGUIENTE[nivel]
  const miPaso = pasoDatosDe(nivel)

  // --- "crear" ---
  if (modo === "crear") {
    if (nivel === "primaria") {
      return (
        <div className="space-y-4">
          {/* "Prototype" -- clona los campos de otra Primaria ya existente a este
              formulario ANTES de crear nada; la base de datos no se entera, es puro
              front (ver clonarDesde en useInscripcionForm). */}
          {wizard.clonarAbierto ? (
            <div className="space-y-3 rounded-lg border border-dashed border-input p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">Elegí la solicitud a clonar</h4>
                <Button variant="outline" size="sm" onClick={() => wizard.setClonarAbierto(false)}>
                  Cancelar
                </Button>
              </div>
              <CampoSelect
                idPrefix="pago-tf-clonar"
                valor={wizard.listaIdInput}
                onCambiarValor={wizard.setListaIdInput}
                onBuscar={wizard.buscarPorIdInput}
                buscando={wizard.clonarMutation.isPending}
                hayError={wizard.clonarMutation.isError}
                filtros={wizard.filtrosSolicitudes}
              />
              <CampoVistaDetalle
                modo="seleccionar"
                inscripciones={wizard.solicitudesQuery.data ?? []}
                cargando={wizard.solicitudesQuery.isLoading}
                onSeleccionar={wizard.clonarDesde}
              />
            </div>
          ) : (
            <Button variant="outline" onClick={() => wizard.setClonarAbierto(true)} className="w-fit">
              Crear a partir de una solicitud existente
            </Button>
          )}

          <CamposInscripcionCompletos
            form={perfil.form}
            idPrefix={idPrefix}
            estadosQuery={estadosQuery}
            sistemasQuery={sistemasQuery}
            responsablesQuery={responsablesQuery}
            ambientesQuery={ambientesQuery}
            formaciones={wizard.formacionesNuevas}
            onAgregarFormacion={wizard.agregarFormacionNueva}
            onCambiarFormacion={wizard.cambiarFormacionNueva}
            onQuitarFormacion={wizard.quitarFormacionNueva}
            descripcionAyudaFormaciones="Opcional -- se crean automáticamente después de la solicitud, ya con su id real como referencia."
            catalogoCompleto={wizard.catalogoCompleto}
            responsablesCompletos={wizard.responsablesCompletos}
            datosProyectoCompletos={wizard.datosProyectoCompletos}
            etiquetaAccion="Siguiente"
            onAccion={() => continuarCadena(pasoDe("confirmar-creacion"))}
          />
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Inscripción de {nivel}</h3>
        <CampoCatalogo
          form={perfil.form}
          idPrefix={idPrefix}
          estadosQuery={estadosQuery}
          sistemasQuery={sistemasQuery}
          ambientesQuery={ambientesQuery}
        />
        <CampoResponsables form={perfil.form} idPrefix={idPrefix} responsablesQuery={responsablesQuery} />
        <CampoDatosProyecto form={perfil.form} idPrefix={idPrefix} />
        <BotonesCadena
          hastaPaso={pasoDe(miPaso)}
          // Sin paneles y sin nivel siguiente (universidad) ya no hay a donde continuar:
          // desde aca solo se puede finalizar y enviar.
          siguientePaso={llevaPaneles || siguiente !== null ? trasPaso(miPaso) : undefined}
          etiquetaSiguiente={llevaPaneles ? `Continuar con checklist de ${nivel}` : `Continuar con ${siguiente}`}
          deshabilitado={!perfil.camposCompletos}
          mutation={cadenaMutation}
          onEnviar={enviarCadena}
          onContinuar={continuarCadena}
        />
      </div>
    )
  }

  // --- "actualizar" / "consultar" ---
  // El baseline es contra lo que se comparan los cambios: sin el no hay nada que editar.
  if (esPrimariaActualizar && !wizard.baseline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Cargando solicitud…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{perfil.etiqueta} -- datos de la inscripción</h3>

      {nivel === "primaria" && modo === "actualizar" ? (
        <CamposInscripcionCompletos
          form={perfil.form}
          idPrefix={idPrefix}
          estadosQuery={estadosQuery}
          sistemasQuery={sistemasQuery}
          responsablesQuery={responsablesQuery}
          ambientesQuery={ambientesQuery}
          mostrarPlaceholder={false}
          mostrarEjemplos={false}
          formaciones={wizard.formacionesEditables}
          onAgregarFormacion={wizard.agregarFormacionComplementariaEditable}
          onCambiarFormacion={wizard.cambiarFormacionComplementariaEditable}
          onQuitarFormacion={wizard.quitarFormacionComplementariaEditable}
          descripcionAyudaFormaciones="Lista 1:N ligada a esta solicitud -- podés agregar filas nuevas, borrar las que ya no hagan falta, o editar el texto de las existentes."
          catalogoCompleto={wizard.catalogoCompleto}
          responsablesCompletos={wizard.responsablesCompletos}
          datosProyectoCompletos={wizard.datosProyectoCompletos}
          etiquetaAccion="Guardar cambios"
          onAccion={perfil.guardarCambios}
          deshabilitarAccion={!perfil.huboCambios || perfil.actualizarMutation.isPending}
        />
      ) : (
        <>
          <CampoCatalogo
            form={perfil.form}
            idPrefix={idPrefix}
            estadosQuery={estadosQuery}
            sistemasQuery={sistemasQuery}
            ambientesQuery={ambientesQuery}
            mostrarPlaceholder={false}
            disabled={soloLectura}
          />
          <CampoResponsables
            form={perfil.form}
            idPrefix={idPrefix}
            responsablesQuery={responsablesQuery}
            mostrarPlaceholder={false}
            disabled={soloLectura}
          />
          <CampoDatosProyecto
            form={perfil.form}
            idPrefix={idPrefix}
            mostrarEjemplos={false}
            disabled={soloLectura}
          />
        </>
      )}

      {modo === "actualizar" && (
        <>
          {!perfil.huboCambios && !perfil.confirmado && (
            <p className="text-xs text-muted-foreground">
              No se detectó ningún cambio todavía -- modificá algún campo
              {nivel === "primaria" ? " o alguna formación complementaria" : ""} para poder guardar.
            </p>
          )}
          {!perfil.huboCambios && perfil.confirmado && (
            <Alert>
              <CheckCircle2Icon />
              <AlertTitle>Cambios guardados</AlertTitle>
            </Alert>
          )}
          {perfil.actualizarMutation.isError && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>No se pudo guardar el cambio</AlertTitle>
              <AlertDescription>{(perfil.actualizarMutation.error as Error).message}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Con paneles, de un paso de datos siempre se sigue a los paneles de ESTE nivel; sin
          paneles, el que sigue es el nivel de al lado, que puede no estar encadenado. */}
      <PieNivel
        hayPasoSiguiente={llevaPaneles || perfil.siguienteExiste}
        textoSinSiguiente={siguiente === null ? undefined : `Esta solicitud no tiene una ${siguiente} encadenada.`}
        etiquetaSalir={soloLectura ? "Consultar otra solicitud" : "Actualizar otra solicitud"}
        onSiguiente={() => continuarCadena(trasPaso(miPaso))}
        onSalir={soloLectura ? wizard.consultarOtra : wizard.actualizarOtra}
      >
        {modo === "actualizar" && nivel !== "primaria" && (
          <Button
            variant="outline"
            onClick={perfil.guardarCambios}
            disabled={!perfil.huboCambios || perfil.actualizarMutation.isPending}
            className="w-fit"
          >
            Guardar cambios
          </Button>
        )}
      </PieNivel>
    </div>
  )
}

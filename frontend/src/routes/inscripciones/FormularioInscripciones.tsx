import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { formularioPagoRoute } from "@/router"
import {
  ALTO_ENCABEZADO_ESCRITORIO,
  AvisoVersionesPanel,
  BotonesCadena,
  CampoCatalogo,
  CamposInscripcionCompletos,
  CampoDatosProyecto,
  CampoResponsables,
  CampoSelect,
  CampoVistaDetalle,
  ChecklistEditor,
  DetalleInscripcion,
  DocumentoPanel,
  PANEL_RESUMEN,
  PasosNavegacion,
  PruebasEditor,
  ResumenCadena,
  ResumenVoBo,
  useInscripcionForm,
} from "@/components/inscripcion-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react"

// "Fantasma" que se pisa con el rect real del Card del formulario y, un frame despues, con
// el rect real de la fila nueva del Resumen -- la transicion CSS (transition-all) interpola
// posicion/tamaño entre esos dos rects. onTransitionEnd desmonta el fantasma -- para entonces
// la fila real del Resumen ya esta ahi debajo, la ilusion queda completa.
function TransformacionPaso({
  desde,
  hasta,
  onTerminar,
}: {
  desde: DOMRect
  hasta: DOMRect
  onTerminar: () => void
}) {
  const [rect, setRect] = useState(desde)

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setRect(hasta))
    return () => cancelAnimationFrame(cuadro)
  }, [hasta])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 rounded-xl border bg-card shadow-2xl ring-foreground/20 transition-all duration-500 ease-in-out"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      onTransitionEnd={onTerminar}
    />
  )
}

// Pie de un paso de datos en "actualizar"/"consultar": a donde se va desde aca.
//
// Con paneles, el paso que sigue es el de los paneles de ESTE mismo nivel, que siempre
// existe: alcanza un "Siguiente". Sin paneles (ver llevaPaneles en useInscripcionForm) el
// que sigue es el NIVEL siguiente, que puede no estar encadenado -- y entonces este paso es
// el final del recorrido, asi que en lugar de "Siguiente" va la salida. Los children son los
// botones propios del paso (ej. "Guardar cambios"), que van en la misma fila.
function PieNivel({
  hayPasoSiguiente,
  textoSinSiguiente,
  etiquetaSalir,
  onSiguiente,
  onSalir,
  children,
}: {
  hayPasoSiguiente: boolean
  textoSinSiguiente?: string
  etiquetaSalir: string
  onSiguiente: () => void
  onSalir: () => void
  children?: ReactNode
}) {
  return (
    <>
      {!hayPasoSiguiente && textoSinSiguiente !== undefined && (
        <p className="text-sm text-muted-foreground">{textoSinSiguiente}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {children}
        {hayPasoSiguiente ? (
          <Button onClick={onSiguiente} className="w-fit">
            Siguiente
          </Button>
        ) : (
          <Button variant="outline" onClick={onSalir} className="w-fit">
            {etiquetaSalir}
          </Button>
        )}
      </div>
    </>
  )
}

export function FormularioInscripciones() {
  // "?accion=...&ambiente=..." -- la ruta ya los valido (ver router.tsx) y el hook los
  // consume: elige la accion una sola vez y precarga el ambiente (crear) o su filtro
  // (actualizar). Aca no queda nada mas que pasarlos.
  const wizard = useInscripcionForm(formularioPagoRoute.useSearch())
  const {
    accion,
    empezarDeNuevo,
    // Layout: escritorio vs. columna angosta, el panel colapsable del Resumen, y los 2 refs
    // + el rect del "fantasma" que anima cada paso completado hacia su fila del Resumen.
    esEscritorio,
    resumenPanelRef,
    resumenColapsado,
    setResumenColapsado,
    alternarResumen,
    cardRef,
    resumenRef,
    transformacion,
    limpiarTransformacion,
    current,
    maxStep,
    irAPaso,
    anterior,
    // El flujo: cuantos pasos hay y en que posicion cae cada uno -- depende del ambiente.
    llevaPaneles,
    pasoDe,
    trasPaso,
    // Ni desbloquearHasta ni el api de Embla se usan directo desde el JSX: todo avance pasa
    // por continuarCadena(indice), que hace las dos cosas.
    setApi,
    form,
    campos,
    camposAVistaPrevia,
    catalogoCompleto,
    responsablesCompletos,
    datosProyectoCompletos,
    formularioCompleto,
    estadosQuery,
    sistemasQuery,
    responsablesQuery,
    ambientesQuery,
    tiposPruebaQuery,
    solicitudesQuery,
    filtroEstadoId,
    setFiltroEstadoId,
    filtroSistemaId,
    setFiltroSistemaId,
    filtroAmbienteId,
    setFiltroAmbienteId,
    detalleAbiertoId,
    alternarDetalle,
    formacionesNuevas,
    agregarFormacionNueva,
    cambiarFormacionNueva,
    quitarFormacionNueva,
    crearSolicitudMutation,
    crearSolicitudConFormaciones,
    crearOtra,
    clonarAbierto,
    setClonarAbierto,
    clonarMutation,
    clonarDesde,
    checklistPrimaria,
    checklistPrimariaAcciones,
    pruebasPrimaria,
    pruebasPrimariaAcciones,
    documentoPrimaria,
    setDocumentoPrimaria,
    avisoPrimaria,
    setAvisoPrimaria,
    voBoPrimaria,
    formInscripcionSecundaria,
    inscripcionSecundariaCompleta,
    checklistSecundaria,
    checklistSecundariaAcciones,
    pruebasSecundaria,
    pruebasSecundariaAcciones,
    documentoSecundaria,
    setDocumentoSecundaria,
    avisoSecundaria,
    setAvisoSecundaria,
    voBoSecundaria,
    formInscripcionUniversidad,
    inscripcionUniversidadCompleta,
    checklistUniversidad,
    checklistUniversidadAcciones,
    pruebasUniversidad,
    pruebasUniversidadAcciones,
    documentoUniversidad,
    setDocumentoUniversidad,
    avisoUniversidad,
    setAvisoUniversidad,
    voBoUniversidad,
    cadenaMutation,
    enviarCadena,
    continuarCadena,
    seccionesResumen,
    listaIdInput,
    setListaIdInput,
    buscarPorIdInput,
    elegirSolicitud,
    buscarSolicitudMutation,
    baseline,
    formacionesEditables,
    agregarFormacionComplementariaEditable,
    cambiarFormacionComplementariaEditable,
    quitarFormacionComplementariaEditable,
    hayAlgoQueGuardar,
    actualizarSolicitudMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
    actualizarCargaMutation,
    huboCambiosSecundaria,
    actualizarSecundariaMutation,
    guardarCambiosSecundaria,
    huboCambiosUniversidad,
    actualizarUniversidadMutation,
    guardarCambiosUniversidad,
    guardarPanelesPrimariaMutation,
    guardarPanelesSecundariaMutation,
    guardarPanelesUniversidadMutation,
    consultarMutation,
    consultaTieneSecundaria,
    consultaTieneUniversidad,
    consultarOtra,
    cadenaLista,
  } = wizard

  const encabezado = (
    <>
      <Button variant="outline" size="sm" className="mb-4" nativeButton={false} render={<Link to="/" />}>
        <ArrowLeftIcon />
        Volver al menú principal
      </Button>
      <h2>Solicitudes de inscripción</h2>
    </>
  )

  const pasosNavegacion = (
    <PasosNavegacion
      accion={accion}
      conPaneles={llevaPaneles}
      current={current}
      maxStep={maxStep}
      onIrAPaso={irAPaso}
      pasoEnCurso={cadenaMutation.isPending ? current : null}
      bloqueadoGlobalmente={cadenaMutation.isPending}
    />
  )

  const tarjetaFormulario = (
    <Card ref={cardRef} className="h-full min-w-0">
      <CardContent>
        <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full" orientation="vertical">
          <CarouselContent className="h-(--alto-pasos-wizard)">
            {/* --- Primer paso: "lista" / "datos-primaria" (crear) / "elegir-solicitud" --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "lista" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Inscripciones</h3>

                  {/* Un solo modo a la vez -- CampoSelect decide si se ve "por número" o
                      "por categoría" (toggle interno), nunca los dos juntos. */}
                  <CampoSelect
                    idPrefix="pago-tf-lista"
                    valor={listaIdInput}
                    onCambiarValor={setListaIdInput}
                    onBuscar={buscarPorIdInput}
                    buscando={buscarSolicitudMutation.isPending}
                    hayError={buscarSolicitudMutation.isError}
                    resultado={buscarSolicitudMutation.data}
                    filtros={{
                      filtroEstadoId,
                      onCambiarFiltroEstadoId: setFiltroEstadoId,
                      filtroSistemaId,
                      onCambiarFiltroSistemaId: setFiltroSistemaId,
                      filtroAmbienteId,
                      onCambiarFiltroAmbienteId: setFiltroAmbienteId,
                      estadosQuery,
                      sistemasQuery,
                      ambientesQuery,
                      cargando: solicitudesQuery.isLoading,
                      error: solicitudesQuery.error as Error | null,
                      hayResultados: (solicitudesQuery.data?.length ?? 0) > 0,
                    }}
                  />
                  <CampoVistaDetalle
                    modo="detalle"
                    inscripciones={solicitudesQuery.data ?? []}
                    detalleAbiertoId={detalleAbiertoId}
                    onAlternarDetalle={alternarDetalle}
                  />
                </div>
              )}

              {/* Selector compartido por "actualizar" y "consultar" -- misma lista, mismo
                  CampoSelect/CampoVistaDetalle (ver useSolicitudes en useInscripcionForm);
                  lo que se hace DESPUES de elegir una fila es lo que distingue a cada accion
                  (editar campos vs. recorrer la cadena de solo lectura). */}

              {(accion === "actualizar" || accion === "consultar") && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Elegí cualquier solicitud de la cadena -- se recorre toda la cadena
                    completa a partir de su Primaria ({accion === "consultar" ? "de solo lectura" : "editable"}
                    , si tiene Secundaria y/o Universidad encadenadas también se incluyen).
                  </p>
                  <CampoSelect
                    idPrefix="pago-tf"
                    valor={listaIdInput}
                    onCambiarValor={setListaIdInput}
                    onBuscar={buscarPorIdInput}
                    buscando={buscarSolicitudMutation.isPending}
                    hayError={buscarSolicitudMutation.isError}
                  />

                  <CampoVistaDetalle
                    modo="seleccionar"
                    inscripciones={solicitudesQuery.data ?? []}
                    cargando={solicitudesQuery.isLoading}
                    onSeleccionar={elegirSolicitud}
                  />

                  {accion === "consultar" && consultarMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudo cargar la cadena</AlertTitle>
                      <AlertDescription>{(consultarMutation.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                  {accion === "actualizar" && actualizarCargaMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudo cargar la cadena</AlertTitle>
                      <AlertDescription>{(actualizarCargaMutation.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {accion === "crear" && (
                <div className="space-y-4">
                  {/* "Prototype" -- clona los campos de otra Primaria ya existente a este
                      formulario ANTES de crear nada; la base de datos no se entera, es
                      puro front (ver clonarDesde en useInscripcionForm). */}
                  {clonarAbierto ? (
                    <div className="space-y-3 rounded-lg border border-dashed border-input p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium">Elegí la solicitud a clonar</h4>
                        <Button variant="outline" size="sm" onClick={() => setClonarAbierto(false)}>
                          Cancelar
                        </Button>
                      </div>
                      <CampoSelect
                        idPrefix="pago-tf-clonar"
                        valor={listaIdInput}
                        onCambiarValor={setListaIdInput}
                        onBuscar={buscarPorIdInput}
                        buscando={clonarMutation.isPending}
                        hayError={clonarMutation.isError}
                        filtros={{
                          filtroEstadoId,
                          onCambiarFiltroEstadoId: setFiltroEstadoId,
                          filtroSistemaId,
                          onCambiarFiltroSistemaId: setFiltroSistemaId,
                          filtroAmbienteId,
                          onCambiarFiltroAmbienteId: setFiltroAmbienteId,
                          estadosQuery,
                          sistemasQuery,
                          ambientesQuery,
                          cargando: solicitudesQuery.isLoading,
                          error: solicitudesQuery.error as Error | null,
                          hayResultados: (solicitudesQuery.data?.length ?? 0) > 0,
                        }}
                      />
                      <CampoVistaDetalle
                        modo="seleccionar"
                        inscripciones={solicitudesQuery.data ?? []}
                        cargando={solicitudesQuery.isLoading}
                        onSeleccionar={clonarDesde}
                      />
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setClonarAbierto(true)} className="w-fit">
                      Crear a partir de una solicitud existente
                    </Button>
                  )}

                  <CamposInscripcionCompletos
                    form={form}
                    idPrefix="pago-tf"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    responsablesQuery={responsablesQuery}
                    ambientesQuery={ambientesQuery}
                    formaciones={formacionesNuevas}
                    onAgregarFormacion={agregarFormacionNueva}
                    onCambiarFormacion={cambiarFormacionNueva}
                    onQuitarFormacion={quitarFormacionNueva}
                    descripcionAyudaFormaciones="Opcional -- se crean automáticamente después de la solicitud, ya con su id real como referencia."
                    catalogoCompleto={catalogoCompleto}
                    responsablesCompletos={responsablesCompletos}
                    datosProyectoCompletos={datosProyectoCompletos}
                    etiquetaAccion="Siguiente"
                    onAccion={() => continuarCadena(pasoDe("confirmar-creacion"))}
                  />
                </div>
              )}
            </CarouselItem>

            {/* --- "confirmar-creacion" (crear) / "datos-primaria" (actualizar/consultar) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  {crearSolicitudMutation.isSuccess ? (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Solicitud #{crearSolicitudMutation.data.solicitud.id} creada</AlertTitle>
                      </Alert>
                      <DetalleInscripcion inscripcion={crearSolicitudMutation.data.solicitud} />

                      {crearSolicitudMutation.data.formacionesComplementarias.length > 0 && (
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>
                            {crearSolicitudMutation.data.formacionesComplementarias.length} formación
                            {crearSolicitudMutation.data.formacionesComplementarias.length === 1 ? "" : "es"} complementaria
                            {crearSolicitudMutation.data.formacionesComplementarias.length === 1 ? "" : "s"} creada
                            {crearSolicitudMutation.data.formacionesComplementarias.length === 1 ? "" : "s"}
                          </AlertTitle>
                        </Alert>
                      )}

                      {/* La cadena (checklist/pruebas/documentación en adelante) es
                          OPCIONAL -- el usuario puede seguir ahora o irse y crear otra
                          solicitud. */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => continuarCadena(trasPaso("confirmar-creacion"))}
                          className="w-fit"
                        >
                          {llevaPaneles ? "Continuar con checklist, pruebas y documentación" : "Continuar con secundaria"}
                        </Button>
                        <Button onClick={crearOtra} className="w-fit">
                          Crear otra solicitud
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium">Revisá antes de finalizar</h3>
                      <DetalleInscripcion inscripcion={camposAVistaPrevia(campos)} />

                      <Button
                        onClick={crearSolicitudConFormaciones}
                        disabled={!formularioCompleto || crearSolicitudMutation.isPending}
                        className="w-fit"
                      >
                        Finalizar y crear
                      </Button>
                      {crearSolicitudMutation.isError && (
                        <Alert variant="destructive">
                          <TriangleAlertIcon />
                          <AlertTitle>No se pudo crear la solicitud</AlertTitle>
                          <AlertDescription>{(crearSolicitudMutation.error as Error).message}</AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  {!baseline ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner /> Cargando solicitud…
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium">Primaria -- datos de la inscripción</h3>
                      <CamposInscripcionCompletos
                        form={form}
                        idPrefix="pago-tf-edit"
                        estadosQuery={estadosQuery}
                        sistemasQuery={sistemasQuery}
                        responsablesQuery={responsablesQuery}
                        ambientesQuery={ambientesQuery}
                        mostrarPlaceholder={false}
                        mostrarEjemplos={false}
                        formaciones={formacionesEditables}
                        onAgregarFormacion={agregarFormacionComplementariaEditable}
                        onCambiarFormacion={cambiarFormacionComplementariaEditable}
                        onQuitarFormacion={quitarFormacionComplementariaEditable}
                        descripcionAyudaFormaciones="Lista 1:N ligada a esta solicitud -- podés agregar filas nuevas, borrar las que ya no hagan falta, o editar el texto de las existentes."
                        catalogoCompleto={catalogoCompleto}
                        responsablesCompletos={responsablesCompletos}
                        datosProyectoCompletos={datosProyectoCompletos}
                        etiquetaAccion="Guardar cambios"
                        onAccion={guardarCambios}
                        deshabilitarAccion={!hayAlgoQueGuardar || actualizarSolicitudMutation.isPending}
                      />
                      {!hayAlgoQueGuardar && (
                        <p className="text-xs text-muted-foreground">
                          No se detectó ningún cambio todavía -- modificá algún campo o
                          alguna formación complementaria para poder guardar.
                        </p>
                      )}
                      {guardadoConfirmado && !hayAlgoQueGuardar && (
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>Cambios guardados</AlertTitle>
                        </Alert>
                      )}
                      {actualizarSolicitudMutation.isError && (
                        <Alert variant="destructive">
                          <TriangleAlertIcon />
                          <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                          <AlertDescription>
                            {(actualizarSolicitudMutation.error as Error).message}
                          </AlertDescription>
                        </Alert>
                      )}
                      <PieNivel
                        hayPasoSiguiente={llevaPaneles || consultaTieneSecundaria}
                        textoSinSiguiente="Esta solicitud no tiene una secundaria encadenada."
                        etiquetaSalir="Actualizar otra solicitud"
                        onSiguiente={() => continuarCadena(trasPaso("datos-primaria"))}
                        onSalir={actualizarOtra}
                      />
                    </>
                  )}
                </div>
              )}

              {accion === "consultar" && cadenaLista && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Primaria -- datos de la inscripción</h3>
                  <CampoCatalogo
                    form={form}
                    idPrefix="consultar-p"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoResponsables
                    form={form}
                    idPrefix="consultar-p"
                    responsablesQuery={responsablesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoDatosProyecto form={form} idPrefix="consultar-p" mostrarEjemplos={false} disabled />
                  <PieNivel
                    hayPasoSiguiente={llevaPaneles || consultaTieneSecundaria}
                    textoSinSiguiente="Esta solicitud no tiene una secundaria encadenada."
                    etiquetaSalir="Consultar otra solicitud"
                    onSiguiente={() => continuarCadena(trasPaso("datos-primaria"))}
                    onSalir={consultarOtra}
                  />
                </div>
              )}
            </CarouselItem>

            {/* --- "paneles-primaria": checklist/pruebas/documentación/aviso de versiones.
                Este paso SOLO existe en el ambiente principal -- en cualquier otro, una
                inscripción es nada más sus datos y el flujo no lo monta (ver llevaPaneles en
                useInscripcionForm y pasosDe en types.ts), por eso los índices de los pasos que
                siguen se corren y hay que preguntarlos con pasoDe/trasPaso. No hay un paso de
                Confirmación aparte por nivel: el VoBo que devuelve el servidor y los botones de
                la cadena viven en este mismo paso, debajo de los paneles. --- */}
            {llevaPaneles && (
              <CarouselItem className="overflow-y-auto">
                {accion === "crear" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Primaria -- checklist, pruebas y documentación</h3>
                    <p className="text-xs text-muted-foreground">
                      Todo es opcional en este paso: podés enviarlo incompleto y completarlo
                      después, o seguir con el resto de la cadena.
                    </p>
                    <ChecklistEditor
                      items={checklistPrimaria}
                      onAgregar={checklistPrimariaAcciones.agregar}
                      onCambiar={checklistPrimariaAcciones.cambiar}
                      onQuitar={checklistPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasPrimaria}
                      onAgregar={pruebasPrimariaAcciones.agregar}
                      onCambiar={pruebasPrimariaAcciones.cambiar}
                      onQuitar={pruebasPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="cadena-dp" valor={documentoPrimaria} onCambiar={setDocumentoPrimaria} />
                    <AvisoVersionesPanel idPrefix="cadena-dp" valor={avisoPrimaria} onCambiar={setAvisoPrimaria} />
                    {/* El VoBo lo calcula el servidor al guardar los paneles: antes de
                        "Finalizar y enviar" no hay nada que mostrar todavia. */}
                    {voBoPrimaria !== null && <ResumenVoBo voBo={voBoPrimaria} />}
                    <BotonesCadena
                      hastaPaso={pasoDe("paneles-primaria")}
                      siguientePaso={pasoDe("datos-secundaria")}
                      etiquetaSiguiente="Continuar con secundaria"
                      mutation={cadenaMutation}
                      onEnviar={enviarCadena}
                      onContinuar={continuarCadena}
                    />
                  </div>
                )}

                {accion === "consultar" && cadenaLista && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Primaria -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistPrimaria}
                      onAgregar={checklistPrimariaAcciones.agregar}
                      onCambiar={checklistPrimariaAcciones.cambiar}
                      onQuitar={checklistPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                      disabled
                    />
                    <PruebasEditor
                      items={pruebasPrimaria}
                      onAgregar={pruebasPrimariaAcciones.agregar}
                      onCambiar={pruebasPrimariaAcciones.cambiar}
                      onQuitar={pruebasPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                      disabled
                    />
                    <DocumentoPanel idPrefix="consultar-dp" valor={documentoPrimaria} onCambiar={setDocumentoPrimaria} disabled />
                    <AvisoVersionesPanel idPrefix="consultar-dp" valor={avisoPrimaria} onCambiar={setAvisoPrimaria} disabled />
                  </div>
                )}

                {accion === "actualizar" && cadenaLista && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Primaria -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistPrimaria}
                      onAgregar={checklistPrimariaAcciones.agregar}
                      onCambiar={checklistPrimariaAcciones.cambiar}
                      onQuitar={checklistPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasPrimaria}
                      onAgregar={pruebasPrimariaAcciones.agregar}
                      onCambiar={pruebasPrimariaAcciones.cambiar}
                      onQuitar={pruebasPrimariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="actualizar-dp" valor={documentoPrimaria} onCambiar={setDocumentoPrimaria} />
                    <AvisoVersionesPanel idPrefix="actualizar-dp" valor={avisoPrimaria} onCambiar={setAvisoPrimaria} />
                    {guardarPanelesPrimariaMutation.isSuccess && (
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Cambios guardados</AlertTitle>
                      </Alert>
                    )}
                    {guardarPanelesPrimariaMutation.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                        <AlertDescription>{(guardarPanelesPrimariaMutation.error as Error).message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => guardarPanelesPrimariaMutation.mutate()}
                        disabled={guardarPanelesPrimariaMutation.isPending}
                        className="w-fit"
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                )}

                {(accion === "consultar" || accion === "actualizar") && cadenaLista && (
                  <div className="mt-4 space-y-4">
                    <ResumenVoBo voBo={voBoPrimaria} />
                    {consultaTieneSecundaria ? (
                      <Button onClick={() => continuarCadena(pasoDe("datos-secundaria"))} className="w-fit">
                        Ver secundaria
                      </Button>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Esta solicitud no tiene una secundaria encadenada.
                        </p>
                        <Button
                          variant="outline"
                          onClick={accion === "consultar" ? consultarOtra : actualizarOtra}
                          className="w-fit"
                        >
                          {accion === "consultar" ? "Consultar otra solicitud" : "Actualizar otra solicitud"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CarouselItem>
            )}

            {/* --- "datos-secundaria" --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Inscripción de secundaria</h3>
                  <CampoCatalogo
                    form={formInscripcionSecundaria}
                    idPrefix="cadena-is"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                  />
                  <CampoResponsables
                    form={formInscripcionSecundaria}
                    idPrefix="cadena-is"
                    responsablesQuery={responsablesQuery}
                  />
                  <CampoDatosProyecto form={formInscripcionSecundaria} idPrefix="cadena-is" />
                  <BotonesCadena
                    hastaPaso={pasoDe("datos-secundaria")}
                    siguientePaso={trasPaso("datos-secundaria")}
                    etiquetaSiguiente={
                      llevaPaneles ? "Continuar con checklist de secundaria" : "Continuar con universidad"
                    }
                    deshabilitado={!inscripcionSecundariaCompleta}
                    mutation={cadenaMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}

              {accion === "consultar" && consultaTieneSecundaria && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Secundaria -- datos de la inscripción</h3>
                  <CampoCatalogo
                    form={formInscripcionSecundaria}
                    idPrefix="consultar-s"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoResponsables
                    form={formInscripcionSecundaria}
                    idPrefix="consultar-s"
                    responsablesQuery={responsablesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoDatosProyecto form={formInscripcionSecundaria} idPrefix="consultar-s" mostrarEjemplos={false} disabled />
                  <PieNivel
                    hayPasoSiguiente={llevaPaneles || consultaTieneUniversidad}
                    textoSinSiguiente="Esta solicitud no tiene una universidad encadenada."
                    etiquetaSalir="Consultar otra solicitud"
                    onSiguiente={() => continuarCadena(trasPaso("datos-secundaria"))}
                    onSalir={consultarOtra}
                  />
                </div>
              )}

              {accion === "actualizar" && consultaTieneSecundaria && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Secundaria -- datos de la inscripción</h3>
                  <CampoCatalogo
                    form={formInscripcionSecundaria}
                    idPrefix="actualizar-s"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                    mostrarPlaceholder={false}
                  />
                  <CampoResponsables
                    form={formInscripcionSecundaria}
                    idPrefix="actualizar-s"
                    responsablesQuery={responsablesQuery}
                    mostrarPlaceholder={false}
                  />
                  <CampoDatosProyecto form={formInscripcionSecundaria} idPrefix="actualizar-s" mostrarEjemplos={false} />
                  {!huboCambiosSecundaria && actualizarSecundariaMutation.isSuccess && (
                    <Alert>
                      <CheckCircle2Icon />
                      <AlertTitle>Cambios guardados</AlertTitle>
                    </Alert>
                  )}
                  {actualizarSecundariaMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                      <AlertDescription>{(actualizarSecundariaMutation.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                  <PieNivel
                    hayPasoSiguiente={llevaPaneles || consultaTieneUniversidad}
                    textoSinSiguiente="Esta solicitud no tiene una universidad encadenada."
                    etiquetaSalir="Actualizar otra solicitud"
                    onSiguiente={() => continuarCadena(trasPaso("datos-secundaria"))}
                    onSalir={actualizarOtra}
                  >
                    <Button
                      variant="outline"
                      onClick={guardarCambiosSecundaria}
                      disabled={!huboCambiosSecundaria || actualizarSecundariaMutation.isPending}
                      className="w-fit"
                    >
                      Guardar cambios
                    </Button>
                  </PieNivel>
                </div>
              )}
            </CarouselItem>

            {/* --- "paneles-secundaria": checklist/pruebas/documentación/aviso de versiones.
                Este paso SOLO existe en el ambiente principal -- en cualquier otro, una
                inscripción es nada más sus datos y el flujo no lo monta (ver llevaPaneles en
                useInscripcionForm y pasosDe en types.ts), por eso los índices de los pasos que
                siguen se corren y hay que preguntarlos con pasoDe/trasPaso. No hay un paso de
                Confirmación aparte por nivel: el VoBo que devuelve el servidor y los botones de
                la cadena viven en este mismo paso, debajo de los paneles. --- */}
            {llevaPaneles && (
              <CarouselItem className="overflow-y-auto">
                {accion === "crear" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Secundaria -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistSecundaria}
                      onAgregar={checklistSecundariaAcciones.agregar}
                      onCambiar={checklistSecundariaAcciones.cambiar}
                      onQuitar={checklistSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasSecundaria}
                      onAgregar={pruebasSecundariaAcciones.agregar}
                      onCambiar={pruebasSecundariaAcciones.cambiar}
                      onQuitar={pruebasSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="cadena-ds" valor={documentoSecundaria} onCambiar={setDocumentoSecundaria} />
                    <AvisoVersionesPanel idPrefix="cadena-ds" valor={avisoSecundaria} onCambiar={setAvisoSecundaria} />
                    {/* El VoBo lo calcula el servidor al guardar los paneles: antes de
                        "Finalizar y enviar" no hay nada que mostrar todavia. */}
                    {voBoSecundaria !== null && <ResumenVoBo voBo={voBoSecundaria} />}
                    <BotonesCadena
                      hastaPaso={pasoDe("paneles-secundaria")}
                      siguientePaso={pasoDe("datos-universidad")}
                      etiquetaSiguiente="Continuar con universidad"
                      mutation={cadenaMutation}
                      onEnviar={enviarCadena}
                      onContinuar={continuarCadena}
                    />
                  </div>
                )}

                {accion === "consultar" && consultaTieneSecundaria && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Secundaria -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistSecundaria}
                      onAgregar={checklistSecundariaAcciones.agregar}
                      onCambiar={checklistSecundariaAcciones.cambiar}
                      onQuitar={checklistSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                      disabled
                    />
                    <PruebasEditor
                      items={pruebasSecundaria}
                      onAgregar={pruebasSecundariaAcciones.agregar}
                      onCambiar={pruebasSecundariaAcciones.cambiar}
                      onQuitar={pruebasSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                      disabled
                    />
                    <DocumentoPanel idPrefix="consultar-ds" valor={documentoSecundaria} onCambiar={setDocumentoSecundaria} disabled />
                    <AvisoVersionesPanel idPrefix="consultar-ds" valor={avisoSecundaria} onCambiar={setAvisoSecundaria} disabled />
                  </div>
                )}

                {accion === "actualizar" && consultaTieneSecundaria && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Secundaria -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistSecundaria}
                      onAgregar={checklistSecundariaAcciones.agregar}
                      onCambiar={checklistSecundariaAcciones.cambiar}
                      onQuitar={checklistSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasSecundaria}
                      onAgregar={pruebasSecundariaAcciones.agregar}
                      onCambiar={pruebasSecundariaAcciones.cambiar}
                      onQuitar={pruebasSecundariaAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="actualizar-ds" valor={documentoSecundaria} onCambiar={setDocumentoSecundaria} />
                    <AvisoVersionesPanel idPrefix="actualizar-ds" valor={avisoSecundaria} onCambiar={setAvisoSecundaria} />
                    {guardarPanelesSecundariaMutation.isSuccess && (
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Cambios guardados</AlertTitle>
                      </Alert>
                    )}
                    {guardarPanelesSecundariaMutation.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                        <AlertDescription>{(guardarPanelesSecundariaMutation.error as Error).message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => guardarPanelesSecundariaMutation.mutate()}
                        disabled={guardarPanelesSecundariaMutation.isPending}
                        className="w-fit"
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                )}

                {(accion === "consultar" || accion === "actualizar") && consultaTieneSecundaria && (
                  <div className="mt-4 space-y-4">
                    <ResumenVoBo voBo={voBoSecundaria} />
                    {consultaTieneUniversidad ? (
                      <Button onClick={() => continuarCadena(pasoDe("datos-universidad"))} className="w-fit">
                        Ver universidad
                      </Button>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Esta solicitud no tiene una universidad encadenada.
                        </p>
                        <Button
                          variant="outline"
                          onClick={accion === "consultar" ? consultarOtra : actualizarOtra}
                          className="w-fit"
                        >
                          {accion === "consultar" ? "Consultar otra solicitud" : "Actualizar otra solicitud"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CarouselItem>
            )}

            {/* --- "datos-universidad" --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Inscripción de universidad</h3>
                  <CampoCatalogo
                    form={formInscripcionUniversidad}
                    idPrefix="cadena-iu"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                  />
                  <CampoResponsables
                    form={formInscripcionUniversidad}
                    idPrefix="cadena-iu"
                    responsablesQuery={responsablesQuery}
                  />
                  <CampoDatosProyecto form={formInscripcionUniversidad} idPrefix="cadena-iu" />
                  <BotonesCadena
                    hastaPaso={pasoDe("datos-universidad")}
                    siguientePaso={llevaPaneles ? pasoDe("paneles-universidad") : undefined}
                    etiquetaSiguiente="Continuar con checklist de universidad"
                    deshabilitado={!inscripcionUniversidadCompleta}
                    mutation={cadenaMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}

              {accion === "consultar" && consultaTieneUniversidad && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Universidad -- datos de la inscripción</h3>
                  <CampoCatalogo
                    form={formInscripcionUniversidad}
                    idPrefix="consultar-u"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoResponsables
                    form={formInscripcionUniversidad}
                    idPrefix="consultar-u"
                    responsablesQuery={responsablesQuery}
                    mostrarPlaceholder={false}
                    disabled
                  />
                  <CampoDatosProyecto form={formInscripcionUniversidad} idPrefix="consultar-u" mostrarEjemplos={false} disabled />
                  <PieNivel
                    hayPasoSiguiente={llevaPaneles}
                    etiquetaSalir="Consultar otra solicitud"
                    onSiguiente={() => continuarCadena(trasPaso("datos-universidad"))}
                    onSalir={consultarOtra}
                  />
                </div>
              )}

              {accion === "actualizar" && consultaTieneUniversidad && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Universidad -- datos de la inscripción</h3>
                  <CampoCatalogo
                    form={formInscripcionUniversidad}
                    idPrefix="actualizar-u"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                    mostrarPlaceholder={false}
                  />
                  <CampoResponsables
                    form={formInscripcionUniversidad}
                    idPrefix="actualizar-u"
                    responsablesQuery={responsablesQuery}
                    mostrarPlaceholder={false}
                  />
                  <CampoDatosProyecto form={formInscripcionUniversidad} idPrefix="actualizar-u" mostrarEjemplos={false} />
                  {!huboCambiosUniversidad && actualizarUniversidadMutation.isSuccess && (
                    <Alert>
                      <CheckCircle2Icon />
                      <AlertTitle>Cambios guardados</AlertTitle>
                    </Alert>
                  )}
                  {actualizarUniversidadMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                      <AlertDescription>{(actualizarUniversidadMutation.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                  <PieNivel
                    hayPasoSiguiente={llevaPaneles}
                    etiquetaSalir="Actualizar otra solicitud"
                    onSiguiente={() => continuarCadena(trasPaso("datos-universidad"))}
                    onSalir={actualizarOtra}
                  >
                    <Button
                      variant="outline"
                      onClick={guardarCambiosUniversidad}
                      disabled={!huboCambiosUniversidad || actualizarUniversidadMutation.isPending}
                      className="w-fit"
                    >
                      Guardar cambios
                    </Button>
                  </PieNivel>
                </div>
              )}
            </CarouselItem>

            {/* --- "paneles-universidad": checklist/pruebas/documentación/aviso de versiones.
                Este paso SOLO existe en el ambiente principal -- en cualquier otro, una
                inscripción es nada más sus datos y el flujo no lo monta (ver llevaPaneles en
                useInscripcionForm y pasosDe en types.ts), por eso los índices de los pasos que
                siguen se corren y hay que preguntarlos con pasoDe/trasPaso. No hay un paso de
                Confirmación aparte por nivel: el VoBo que devuelve el servidor y los botones de
                la cadena viven en este mismo paso, debajo de los paneles. --- */}
            {llevaPaneles && (
              <CarouselItem className="overflow-y-auto">
                {accion === "crear" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Universidad -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistUniversidad}
                      onAgregar={checklistUniversidadAcciones.agregar}
                      onCambiar={checklistUniversidadAcciones.cambiar}
                      onQuitar={checklistUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasUniversidad}
                      onAgregar={pruebasUniversidadAcciones.agregar}
                      onCambiar={pruebasUniversidadAcciones.cambiar}
                      onQuitar={pruebasUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="cadena-du" valor={documentoUniversidad} onCambiar={setDocumentoUniversidad} />
                    <AvisoVersionesPanel idPrefix="cadena-du" valor={avisoUniversidad} onCambiar={setAvisoUniversidad} />
                    {/* El VoBo lo calcula el servidor al guardar los paneles: antes de
                        "Finalizar y enviar" no hay nada que mostrar todavia. */}
                    {voBoUniversidad !== null && <ResumenVoBo voBo={voBoUniversidad} />}
                    <BotonesCadena
                      hastaPaso={pasoDe("paneles-universidad")}
                      mutation={cadenaMutation}
                      onEnviar={enviarCadena}
                    />
                  </div>
                )}

                {accion === "consultar" && consultaTieneUniversidad && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Universidad -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistUniversidad}
                      onAgregar={checklistUniversidadAcciones.agregar}
                      onCambiar={checklistUniversidadAcciones.cambiar}
                      onQuitar={checklistUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                      disabled
                    />
                    <PruebasEditor
                      items={pruebasUniversidad}
                      onAgregar={pruebasUniversidadAcciones.agregar}
                      onCambiar={pruebasUniversidadAcciones.cambiar}
                      onQuitar={pruebasUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                      disabled
                    />
                    <DocumentoPanel idPrefix="consultar-du" valor={documentoUniversidad} onCambiar={setDocumentoUniversidad} disabled />
                    <AvisoVersionesPanel idPrefix="consultar-du" valor={avisoUniversidad} onCambiar={setAvisoUniversidad} disabled />
                  </div>
                )}

                {accion === "actualizar" && consultaTieneUniversidad && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Universidad -- checklist, pruebas y documentación</h3>
                    <ChecklistEditor
                      items={checklistUniversidad}
                      onAgregar={checklistUniversidadAcciones.agregar}
                      onCambiar={checklistUniversidadAcciones.cambiar}
                      onQuitar={checklistUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      responsablesQuery={responsablesQuery}
                    />
                    <PruebasEditor
                      items={pruebasUniversidad}
                      onAgregar={pruebasUniversidadAcciones.agregar}
                      onCambiar={pruebasUniversidadAcciones.cambiar}
                      onQuitar={pruebasUniversidadAcciones.quitar}
                      estadosQuery={estadosQuery}
                      tiposPruebaQuery={tiposPruebaQuery}
                    />
                    <DocumentoPanel idPrefix="actualizar-du" valor={documentoUniversidad} onCambiar={setDocumentoUniversidad} />
                    <AvisoVersionesPanel idPrefix="actualizar-du" valor={avisoUniversidad} onCambiar={setAvisoUniversidad} />
                    {guardarPanelesUniversidadMutation.isSuccess && (
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Cambios guardados</AlertTitle>
                      </Alert>
                    )}
                    {guardarPanelesUniversidadMutation.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                        <AlertDescription>{(guardarPanelesUniversidadMutation.error as Error).message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => guardarPanelesUniversidadMutation.mutate()}
                        disabled={guardarPanelesUniversidadMutation.isPending}
                        className="w-fit"
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                )}

                {(accion === "consultar" || accion === "actualizar") && consultaTieneUniversidad && (
                  <div className="mt-4 space-y-4">
                    <ResumenVoBo voBo={voBoUniversidad} />
                    <Button
                      variant="outline"
                      onClick={accion === "consultar" ? consultarOtra : actualizarOtra}
                      className="w-fit"
                    >
                      {accion === "consultar" ? "Consultar otra solicitud" : "Actualizar otra solicitud"}
                    </Button>
                  </div>
                )}
              </CarouselItem>
            )}

            {/* --- "confirmar-cadena": resultado de "Finalizar y enviar" (SOLO "crear") -- unico
                lugar que lo muestra, sin importar desde que paso se haya disparado (ver
                cadenaMutation.onSuccess en useInscripcionForm). "actualizar"/"consultar" no usan
                este slide: terminan en el ultimo paso del nivel universidad. --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  {cadenaMutation.isSuccess ? (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Cadena enviada</AlertTitle>
                      </Alert>
                      <Button onClick={crearOtra} className="w-fit">
                        Crear otra solicitud
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Todavía no se envió nada de la cadena. «Finalizar y enviar» está en cada
                      paso (no hace falta llegar hasta acá) y el resultado se muestra en este.
                    </p>
                  )}
                </div>
              )}
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={anterior} disabled={current === 0}>
          Atrás
        </Button>
        {accion !== null && (
          <Button variant="outline" onClick={empezarDeNuevo} size="sm">
            <RotateCcwIcon />
            Empezar de nuevo
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <section className="mb-12 w-full">
      {esEscritorio ? (
        // ResizablePanelGroup fuerza height:100% por INLINE style (pisa cualquier clase que
        // se le ponga a el mismo) -- la altura real hay que darsela al padre, no al grupo.
        <div className="h-(--alto-wizard-escritorio)">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel
              panelRef={resumenPanelRef}
              collapsible
              collapsedSize={PANEL_RESUMEN.colapsado}
              defaultSize={PANEL_RESUMEN.defecto}
              minSize={PANEL_RESUMEN.minimo}
              maxSize={PANEL_RESUMEN.maximo}
              // El tamaño llega por parametro -- no se le pregunta al handle imperativo
              // (isCollapsed() tira excepcion si el panel todavia/ya no esta registrado,
              // ver alternarResumen en useInscripcionForm). collapsedSize es "0px", asi que
              // "0 pixeles" ES colapsado.
              onResize={(tamano) => setResumenColapsado(tamano.inPixels <= 0)}
            >
              <ResumenCadena ref={resumenRef} secciones={seccionesResumen} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              {/* Division encabezado/formulario fija -- a diferencia de la de arriba, esta
                  NO se arrastra (handle disabled, sin grip): el encabezado es un titulo, no
                  tiene sentido redimensionarlo. */}
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={ALTO_ENCABEZADO_ESCRITORIO} disabled>
                  <div className="flex h-full items-start justify-between gap-2 overflow-y-auto">
                    <div>{encabezado}</div>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={alternarResumen}
                      title={resumenColapsado ? "Mostrar resumen" : "Ocultar resumen"}
                    >
                      {resumenColapsado ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
                    </Button>
                  </div>
                </ResizablePanel>
                <ResizableHandle disabled />
                <ResizablePanel disabled>
                  <div className="flex h-full flex-col gap-4 overflow-y-auto">
                    {pasosNavegacion}
                    {tarjetaFormulario}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="w-full">
          {encabezado}
          {pasosNavegacion}
          {tarjetaFormulario}
        </div>
      )}

      {transformacion && (
        <TransformacionPaso
          desde={transformacion.desde}
          hasta={transformacion.hasta}
          onTerminar={limpiarTransformacion}
        />
      )}
    </section>
  )
}

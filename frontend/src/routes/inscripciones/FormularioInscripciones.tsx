import { useEffect, useRef, useState } from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { Link } from "@tanstack/react-router"
import { formularioPagoRoute } from "@/router"
import {
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
import { useMediaQuery } from "@/hooks/useMediaQuery"
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

export function FormularioInscripciones() {
  const wizard = useInscripcionForm()
  const {
    accion,
    elegirAccion,
    empezarDeNuevo,
    current,
    maxStep,
    irAPaso,
    anterior,
    desbloquearHasta,
    setApi,
    api,
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
    useSolicitudes,
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
    camposInscripcionSecundaria,
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
    camposInscripcionUniversidad,
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
  } = wizard

  const solicitudesQuery = useSolicitudes()

  // "actualizar"/"consultar" comparten la misma cadena completa (ver cargarActualizacion/
  // cargarConsulta en useInscripcionForm) -- esta bandera es la unica diferencia real entre
  // ambos al renderizar: si ya esta todo cargado, sin importar cual de las 2 mutaciones lo
  // hizo.
  const cadenaLista =
    (accion === "consultar" && consultarMutation.isSuccess) ||
    (accion === "actualizar" && actualizarCargaMutation.isSuccess)

  // El Resumen de la cadena (panel "Uno") SOLO existe en escritorio -- ni tablet ni celular:
  // ahi se arma como ResizablePanelGroup (el usuario arrastra el ancho a gusto). Por debajo
  // de este corte es una sola columna angosta, sin resumen, el formulario ocupa todo.
  const esEscritorio = useMediaQuery("(min-width: 1024px)")

  // Boton "minimizar de golpe" / "volver a ampliar" el Resumen -- ademas del arrastre normal
  // del handle. panelRef expone collapse()/expand()/isCollapsed() de la libreria; onResize
  // mantiene resumenColapsado sincronizado pase lo que pase.
  const resumenPanelRef = useRef<PanelImperativeHandle>(null)
  const [resumenColapsado, setResumenColapsado] = useState(false)

  function alternarResumen() {
    if (resumenPanelRef.current?.isCollapsed()) {
      resumenPanelRef.current.expand()
    } else {
      resumenPanelRef.current?.collapse()
    }
  }

  // "accion" llega por la URL (?accion=lista|crear|actualizar) -- la elige el submenu de
  // HomePage (ver DrillMenu.tsx) ANTES de navegar aca. No hay paso para elegirla: el paso 0
  // ya es el primero de esa accion. Solo una vez por visita (guarda accion === null).
  // "ambiente" (opcional) viaja junto -- la sucursal que se elegio en ese mismo submenu.
  const { accion: accionInicial, ambiente: ambienteInicial } = formularioPagoRoute.useSearch()
  useEffect(() => {
    if (accionInicial && accion === null) {
      elegirAccion(accionInicial, ambienteInicial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionInicial, ambienteInicial])

  // Cada vez que "Siguiente"/"Continuar" agrega una seccion nueva al Resumen, el paso que se
  // acaba de completar se "transforma" en esa fila: mide el Card ANTES de que la fila nueva
  // exista, y un frame despues mide la fila real para animar el fantasma de un rect al otro.
  // No corre en el primer montaje ni si el Resumen no esta montado.
  const cardRef = useRef<HTMLDivElement>(null)
  const resumenRef = useRef<HTMLDivElement>(null)
  const seccionesAnteriorRef = useRef(0)
  const montadoRef = useRef(false)
  const [transformacion, setTransformacion] = useState<{ desde: DOMRect; hasta: DOMRect } | null>(null)

  useEffect(() => {
    if (!montadoRef.current) {
      montadoRef.current = true
      seccionesAnteriorRef.current = seccionesResumen.length
      return
    }
    if (seccionesResumen.length > seccionesAnteriorRef.current && cardRef.current) {
      const desde = cardRef.current.getBoundingClientRect()
      const cuadro = requestAnimationFrame(() => {
        const contenido = resumenRef.current?.querySelector('[data-slot="card-content"]')
        const filaNueva = contenido?.lastElementChild
        if (filaNueva) {
          setTransformacion({ desde, hasta: filaNueva.getBoundingClientRect() })
        }
      })
      seccionesAnteriorRef.current = seccionesResumen.length
      return () => cancelAnimationFrame(cuadro)
    }
    seccionesAnteriorRef.current = seccionesResumen.length
  }, [seccionesResumen.length])

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
          <CarouselContent className="h-[min(70vh,36rem)]">
            {/* --- Paso 0 --- */}
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
                  onAccion={() => {
                    desbloquearHasta(1)
                    api?.scrollTo(1)
                  }}
                />
              )}
            </CarouselItem>

            {/* --- Paso 1 --- */}
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
                        <Button variant="outline" onClick={() => continuarCadena(2)} className="w-fit">
                          Continuar con checklist, pruebas y documentación
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
                      <Button onClick={() => continuarCadena(2)} className="w-fit">
                        Siguiente
                      </Button>
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
                  <Button onClick={() => continuarCadena(2)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 2: Checklist/pruebas/documentación/aviso de versiones (primaria) --- */}
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
                  <Button onClick={() => continuarCadena(3)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}

              {(accion === "consultar" || accion === "actualizar") && cadenaLista && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: primaria</h3>
                  <DetalleInscripcion inscripcion={camposAVistaPrevia(campos)} />
                  <Button onClick={() => continuarCadena(3)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 3: Confirmación (primaria) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: primaria</h3>
                  <ResumenVoBo voBo={voBoPrimaria} />
                  <BotonesCadena
                    hastaPaso={2}
                    siguientePaso={4}
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
                  <Button onClick={() => continuarCadena(4)} className="w-fit">
                    Siguiente
                  </Button>
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
                    <Button onClick={() => continuarCadena(4)} className="w-fit">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 4: Datos de la inscripción secundaria --- */}
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
                  <Button
                    onClick={() => continuarCadena(5)}
                    disabled={!inscripcionSecundariaCompleta}
                    className="w-fit"
                  >
                    Siguiente
                  </Button>
                </div>
              )}

              {(accion === "consultar" || accion === "actualizar") && cadenaLista && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: primaria</h3>
                  <ResumenVoBo voBo={voBoPrimaria} />
                  {consultaTieneSecundaria ? (
                    <Button onClick={() => continuarCadena(5)} className="w-fit">
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

            {/* --- Paso 5: Confirmación (inscripción secundaria) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: inscripción de secundaria</h3>
                  <DetalleInscripcion inscripcion={camposAVistaPrevia(camposInscripcionSecundaria)} />
                  <BotonesCadena
                    hastaPaso={4}
                    siguientePaso={6}
                    etiquetaSiguiente="Continuar con checklist de secundaria"
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
                  <Button onClick={() => continuarCadena(6)} className="w-fit">
                    Siguiente
                  </Button>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={guardarCambiosSecundaria}
                      disabled={!huboCambiosSecundaria || actualizarSecundariaMutation.isPending}
                      className="w-fit"
                    >
                      Guardar cambios
                    </Button>
                    <Button onClick={() => continuarCadena(6)} className="w-fit">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 6: Checklist/pruebas/documentación/aviso de versiones (secundaria) --- */}
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
                  <Button onClick={() => continuarCadena(7)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}

              {(accion === "consultar" || accion === "actualizar") && consultaTieneSecundaria && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: inscripción de secundaria</h3>
                  <DetalleInscripcion inscripcion={camposAVistaPrevia(camposInscripcionSecundaria)} />
                  <Button onClick={() => continuarCadena(7)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 7: Confirmación (secundaria) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: secundaria</h3>
                  <ResumenVoBo voBo={voBoSecundaria} />
                  <BotonesCadena
                    hastaPaso={6}
                    siguientePaso={8}
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
                  <Button onClick={() => continuarCadena(8)} className="w-fit">
                    Siguiente
                  </Button>
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
                    <Button onClick={() => continuarCadena(8)} className="w-fit">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 8: Datos de la inscripción universidad --- */}
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
                  <Button
                    onClick={() => continuarCadena(9)}
                    disabled={!inscripcionUniversidadCompleta}
                    className="w-fit"
                  >
                    Siguiente
                  </Button>
                </div>
              )}

              {(accion === "consultar" || accion === "actualizar") && consultaTieneSecundaria && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: secundaria</h3>
                  <ResumenVoBo voBo={voBoSecundaria} />
                  {consultaTieneUniversidad ? (
                    <Button onClick={() => continuarCadena(9)} className="w-fit">
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

            {/* --- Paso 9: Confirmación (inscripción universidad) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: inscripción de universidad</h3>
                  <DetalleInscripcion inscripcion={camposAVistaPrevia(camposInscripcionUniversidad)} />
                  <BotonesCadena
                    hastaPaso={8}
                    siguientePaso={10}
                    etiquetaSiguiente="Continuar con checklist de universidad"
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
                  <Button onClick={() => continuarCadena(10)} className="w-fit">
                    Siguiente
                  </Button>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={guardarCambiosUniversidad}
                      disabled={!huboCambiosUniversidad || actualizarUniversidadMutation.isPending}
                      className="w-fit"
                    >
                      Guardar cambios
                    </Button>
                    <Button onClick={() => continuarCadena(10)} className="w-fit">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 10: Checklist/pruebas/documentación/aviso de versiones (universidad) --- */}
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
                  <Button onClick={() => continuarCadena(11)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}

              {(accion === "consultar" || accion === "actualizar") && consultaTieneUniversidad && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: inscripción de universidad</h3>
                  <DetalleInscripcion inscripcion={camposAVistaPrevia(camposInscripcionUniversidad)} />
                  <Button onClick={() => continuarCadena(11)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 11: Confirmación final (crear) -- unico lugar que muestra el resultado
                de "Finalizar y enviar", sin importar desde que Confirmacion se haya disparado
                (ver cadenaMutation.onSuccess en useInscripcionForm). Paso 11 de "consultar" es
                el checklist de universidad (un paso corrido respecto de "crear"). --- */}
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
                    <>
                      <h3 className="text-sm font-medium">Confirmación: universidad</h3>
                      <ResumenVoBo voBo={voBoUniversidad} />
                      <BotonesCadena hastaPaso={10} mutation={cadenaMutation} onEnviar={enviarCadena} />
                    </>
                  )}
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
                  <Button onClick={() => continuarCadena(12)} className="w-fit">
                    Siguiente
                  </Button>
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
                    <Button onClick={() => continuarCadena(12)} className="w-fit">
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 12: Confirmación final (SOLO "consultar"/"actualizar" -- "crear" no usa
                este slide, queda en blanco para esa accion). --- */}
            <CarouselItem className="overflow-y-auto">
              {(accion === "consultar" || accion === "actualizar") && consultaTieneUniversidad && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: universidad</h3>
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
    <section className="w-full">
      {esEscritorio ? (
        // ResizablePanelGroup fuerza height:100% por INLINE style (pisa cualquier clase que
        // se le ponga a el mismo) -- la altura real hay que darsela al padre, no al grupo.
        <div className="h-[min(85vh,900px)]">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel
              panelRef={resumenPanelRef}
              collapsible
              collapsedSize="0px"
              defaultSize="280px"
              minSize="220px"
              maxSize="420px"
              onResize={() => setResumenColapsado(resumenPanelRef.current?.isCollapsed() ?? false)}
            >
              <ResumenCadena ref={resumenRef} secciones={seccionesResumen} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              {/* Division encabezado/formulario fija -- a diferencia de la de arriba, esta
                  NO se arrastra (handle disabled, sin grip): el encabezado es un titulo, no
                  tiene sentido redimensionarlo. */}
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize="96px" disabled>
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
        <div className="max-w-2xl sm:max-w-3xl">
          {encabezado}
          {pasosNavegacion}
          {tarjetaFormulario}
        </div>
      )}

      {transformacion && (
        <TransformacionPaso
          desde={transformacion.desde}
          hasta={transformacion.hasta}
          onTerminar={() => setTransformacion(null)}
        />
      )}
    </section>
  )
}

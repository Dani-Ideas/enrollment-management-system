import { useEffect, useRef, useState } from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { Link } from "@tanstack/react-router"
import { formularioPagoRoute } from "@/router"
import {
  BotonesCadena,
  CampoCatalogo,
  CamposInscripcionCompletos,
  CampoDatosProyecto,
  CampoFirmas,
  CampoResponsables,
  CampoSelect,
  CampoVistaDetalle,
  DetalleInscripcion,
  PasosNavegacion,
  ResumenCadena,
  ResumenFirmas,
  useInscripcionForm,
  FIRMAS_DIPLOMA_PRIMARIA,
  FIRMAS_DIPLOMA_SECUNDARIA,
  FIRMAS_DIPLOMA_UNIVERSIDAD,
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
    useInscripciones,
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
    crearInscripcionMutation,
    crearInscripcionConFormaciones,
    crearOtra,
    diplomaPrimariaFirmas,
    cambiarFirmaDiplomaPrimaria,
    formInscripcionSecundaria,
    camposInscripcionSecundaria,
    inscripcionSecundariaCompleta,
    diplomaSecundariaFirmas,
    cambiarFirmaDiplomaSecundaria,
    formInscripcionUniversidad,
    camposInscripcionUniversidad,
    inscripcionUniversidadCompleta,
    diplomaUniversidadFirmas,
    cambiarFirmaDiplomaUniversidad,
    cadenaDiplomasMutation,
    enviarCadena,
    continuarCadena,
    actualizarCadenaMutation,
    guardarCadena,
    seccionesResumen,
    listaIdInput,
    setListaIdInput,
    buscarPorIdInput,
    elegirSolicitud,
    buscarInscripcionMutation,
    solicitudIdActual,
    baseline,
    formacionesEditables,
    agregarFormacionComplementariaEditable,
    cambiarFormacionComplementariaEditable,
    quitarFormacionComplementariaEditable,
    hayAlgoQueGuardar,
    actualizarInscripcionMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
  } = wizard

  const inscripcionesQuery = useInscripciones()

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
  const { accion: accionInicial } = formularioPagoRoute.useSearch()
  useEffect(() => {
    if (accionInicial && accion === null) {
      elegirAccion(accionInicial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionInicial])

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
      pasoEnCurso={cadenaDiplomasMutation.isPending ? current : null}
      bloqueadoGlobalmente={cadenaDiplomasMutation.isPending}
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
                  <h3 className="text-sm font-medium">Solicitudes existentes</h3>

                  {/* Un solo modo a la vez -- CampoSelect decide si se ve "por número" o
                      "por categoría" (toggle interno), nunca los dos juntos. */}
                  <CampoSelect
                    idPrefix="pago-tf-lista"
                    valor={listaIdInput}
                    onCambiarValor={setListaIdInput}
                    onBuscar={buscarPorIdInput}
                    buscando={buscarInscripcionMutation.isPending}
                    hayError={buscarInscripcionMutation.isError}
                    resultado={buscarInscripcionMutation.data}
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
                      cargando: inscripcionesQuery.isLoading,
                      error: inscripcionesQuery.error as Error | null,
                      hayResultados: (inscripcionesQuery.data?.length ?? 0) > 0,
                    }}
                  />
                  <CampoVistaDetalle
                    modo="detalle"
                    inscripciones={inscripcionesQuery.data ?? []}
                    detalleAbiertoId={detalleAbiertoId}
                    onAlternarDetalle={alternarDetalle}
                  />
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  <CampoSelect
                    idPrefix="pago-tf"
                    valor={listaIdInput}
                    onCambiarValor={setListaIdInput}
                    onBuscar={buscarPorIdInput}
                    buscando={buscarInscripcionMutation.isPending}
                    hayError={buscarInscripcionMutation.isError}
                  />

                  <CampoVistaDetalle
                    modo="seleccionar"
                    inscripciones={inscripcionesQuery.data ?? []}
                    cargando={inscripcionesQuery.isLoading}
                    onSeleccionar={elegirSolicitud}
                  />
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
                  {crearInscripcionMutation.isSuccess ? (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Solicitud #{crearInscripcionMutation.data.inscripcion.id} creada</AlertTitle>
                      </Alert>
                      <DetalleInscripcion inscripcion={crearInscripcionMutation.data.inscripcion} />

                      {crearInscripcionMutation.data.formacionesComplementarias.length > 0 && (
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>
                            {crearInscripcionMutation.data.formacionesComplementarias.length} formación
                            {crearInscripcionMutation.data.formacionesComplementarias.length === 1 ? "" : "es"} complementaria
                            {crearInscripcionMutation.data.formacionesComplementarias.length === 1 ? "" : "s"} creada
                            {crearInscripcionMutation.data.formacionesComplementarias.length === 1 ? "" : "s"}
                          </AlertTitle>
                        </Alert>
                      )}

                      {/* La cadena (diploma de primaria en adelante) es OPCIONAL -- el
                          usuario puede seguir ahora o irse y crear otra solicitud. */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => continuarCadena(2)} className="w-fit">
                          Continuar con el diploma de primaria
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
                        onClick={crearInscripcionConFormaciones}
                        disabled={!formularioCompleto || crearInscripcionMutation.isPending}
                        className="w-fit"
                      >
                        Finalizar y crear
                      </Button>
                      {crearInscripcionMutation.isError && (
                        <Alert variant="destructive">
                          <TriangleAlertIcon />
                          <AlertTitle>No se pudo crear la solicitud</AlertTitle>
                          <AlertDescription>{(crearInscripcionMutation.error as Error).message}</AlertDescription>
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
                        deshabilitarAccion={!hayAlgoQueGuardar || actualizarInscripcionMutation.isPending}
                      />
                      {!hayAlgoQueGuardar && (
                        <p className="text-xs text-muted-foreground">
                          No se detectó ningún cambio todavía -- modificá algún campo o
                          alguna formación complementaria para poder guardar.
                        </p>
                      )}
                      {actualizarInscripcionMutation.isError && (
                        <Alert variant="destructive">
                          <TriangleAlertIcon />
                          <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                          <AlertDescription>
                            {(actualizarInscripcionMutation.error as Error).message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 2: Datos del diploma primaria --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "actualizar" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de primaria</h3>
                  {guardadoConfirmado && (
                    <p className="text-xs text-muted-foreground">Los datos base ya se guardaron.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Opcional: marcá las firmas que ya tengas. El resto de la cadena recién
                    se guarda en la Confirmación final.
                  </p>
                  <CampoFirmas
                    idPrefix="actualizar-dp"
                    items={FIRMAS_DIPLOMA_PRIMARIA}
                    valores={diplomaPrimariaFirmas}
                    onCambiar={cambiarFirmaDiplomaPrimaria}
                  />
                  <Button onClick={() => continuarCadena(3)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}

              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de primaria</h3>
                  <p className="text-xs text-muted-foreground">
                    Opcional: marcá las firmas que ya tengas. Podés enviarlo incompleto y
                    completarlo después, o seguir con el resto de la cadena.
                  </p>
                  <CampoFirmas
                    idPrefix="cadena-dp"
                    items={FIRMAS_DIPLOMA_PRIMARIA}
                    valores={diplomaPrimariaFirmas}
                    onCambiar={cambiarFirmaDiplomaPrimaria}
                  />
                  <Button onClick={() => continuarCadena(3)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 3: Confirmación (diploma primaria) --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: diploma de primaria</h3>
                  <ResumenFirmas items={FIRMAS_DIPLOMA_PRIMARIA} valores={diplomaPrimariaFirmas} />
                  <BotonesCadena
                    hastaPaso={2}
                    siguientePaso={4}
                    etiquetaSiguiente="Continuar con secundaria"
                    mutation={cadenaDiplomasMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Inscripción de secundaria</h3>
                  <CampoCatalogo
                    form={formInscripcionSecundaria}
                    idPrefix="actualizar-is"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                  />
                  <CampoResponsables
                    form={formInscripcionSecundaria}
                    idPrefix="actualizar-is"
                    responsablesQuery={responsablesQuery}
                  />
                  <CampoDatosProyecto form={formInscripcionSecundaria} idPrefix="actualizar-is" />
                  <Button
                    onClick={() => continuarCadena(4)}
                    disabled={!inscripcionSecundariaCompleta}
                    className="w-fit"
                  >
                    Siguiente
                  </Button>
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

              {accion === "actualizar" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de secundaria</h3>
                  <CampoFirmas
                    idPrefix="actualizar-ds"
                    items={FIRMAS_DIPLOMA_SECUNDARIA}
                    valores={diplomaSecundariaFirmas}
                    onCambiar={cambiarFirmaDiplomaSecundaria}
                  />
                  <Button onClick={() => continuarCadena(5)} className="w-fit">
                    Siguiente
                  </Button>
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
                    etiquetaSiguiente="Continuar con diploma de secundaria"
                    mutation={cadenaDiplomasMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Inscripción de universidad</h3>
                  <CampoCatalogo
                    form={formInscripcionUniversidad}
                    idPrefix="actualizar-iu"
                    estadosQuery={estadosQuery}
                    sistemasQuery={sistemasQuery}
                    ambientesQuery={ambientesQuery}
                  />
                  <CampoResponsables
                    form={formInscripcionUniversidad}
                    idPrefix="actualizar-iu"
                    responsablesQuery={responsablesQuery}
                  />
                  <CampoDatosProyecto form={formInscripcionUniversidad} idPrefix="actualizar-iu" />
                  <Button
                    onClick={() => continuarCadena(6)}
                    disabled={!inscripcionUniversidadCompleta}
                    className="w-fit"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 6: Datos del diploma secundaria --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de secundaria</h3>
                  <CampoFirmas
                    idPrefix="cadena-ds"
                    items={FIRMAS_DIPLOMA_SECUNDARIA}
                    valores={diplomaSecundariaFirmas}
                    onCambiar={cambiarFirmaDiplomaSecundaria}
                  />
                  <Button onClick={() => continuarCadena(7)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de universidad</h3>
                  <CampoFirmas
                    idPrefix="actualizar-du"
                    items={FIRMAS_DIPLOMA_UNIVERSIDAD}
                    valores={diplomaUniversidadFirmas}
                    onCambiar={cambiarFirmaDiplomaUniversidad}
                  />
                  <Button onClick={() => continuarCadena(7)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 7: Confirmación (diploma secundaria) en "crear" / Confirmación final
                en "actualizar" -- unico lugar que envia el PUT de la cadena (upsert), sin
                importar que niveles tengan datos de verdad (ver construirCadenaDtoActualizar
                en useInscripcionForm). --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Confirmación: diploma de secundaria</h3>
                  <ResumenFirmas items={FIRMAS_DIPLOMA_SECUNDARIA} valores={diplomaSecundariaFirmas} />
                  <BotonesCadena
                    hastaPaso={6}
                    siguientePaso={8}
                    etiquetaSiguiente="Continuar con universidad"
                    mutation={cadenaDiplomasMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}

              {accion === "actualizar" && (
                <div className="space-y-4">
                  {actualizarCadenaMutation.isSuccess ? (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Solicitud #{solicitudIdActual} actualizada</AlertTitle>
                      </Alert>
                      <ul className="space-y-1 text-sm">
                        {actualizarCadenaMutation.data.diplomaPrimaria && (
                          <li>
                            Diploma de primaria #{actualizarCadenaMutation.data.diplomaPrimaria.id} --{" "}
                            {actualizarCadenaMutation.data.diplomaPrimaria.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                        {actualizarCadenaMutation.data.inscripcionSecundaria && (
                          <li>Inscripción de secundaria guardada.</li>
                        )}
                        {actualizarCadenaMutation.data.diplomaSecundaria && (
                          <li>
                            Diploma de secundaria #{actualizarCadenaMutation.data.diplomaSecundaria.id} --{" "}
                            {actualizarCadenaMutation.data.diplomaSecundaria.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                        {actualizarCadenaMutation.data.inscripcionUniversidad && (
                          <li>Inscripción de universidad guardada.</li>
                        )}
                        {actualizarCadenaMutation.data.diplomaUniversidad && (
                          <li>
                            Diploma de universidad #{actualizarCadenaMutation.data.diplomaUniversidad.id} --{" "}
                            {actualizarCadenaMutation.data.diplomaUniversidad.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                      </ul>
                      <Button onClick={actualizarOtra} className="w-fit">
                        Actualizar otra solicitud
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium">Confirmación</h3>
                      <p className="text-xs text-muted-foreground">
                        Se guarda todo lo llenado en los pasos anteriores (lo que ya existía
                        se actualiza, lo nuevo se crea) en una sola petición.
                      </p>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">Diploma de primaria</p>
                          <ResumenFirmas items={FIRMAS_DIPLOMA_PRIMARIA} valores={diplomaPrimariaFirmas} />
                        </div>
                        <div>
                          <p className="font-medium">Diploma de secundaria</p>
                          <ResumenFirmas items={FIRMAS_DIPLOMA_SECUNDARIA} valores={diplomaSecundariaFirmas} />
                        </div>
                        <div>
                          <p className="font-medium">Diploma de universidad</p>
                          <ResumenFirmas items={FIRMAS_DIPLOMA_UNIVERSIDAD} valores={diplomaUniversidadFirmas} />
                        </div>
                      </div>
                      <Button
                        onClick={guardarCadena}
                        disabled={actualizarCadenaMutation.isPending}
                        className="w-fit"
                      >
                        {actualizarCadenaMutation.isPending && <Spinner />}
                        Guardar
                      </Button>
                      {actualizarCadenaMutation.isError && (
                        <Alert variant="destructive">
                          <TriangleAlertIcon />
                          <AlertTitle>No se pudo guardar la cadena</AlertTitle>
                          <AlertDescription>
                            {(actualizarCadenaMutation.error as Error).message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
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
                    etiquetaSiguiente="Continuar con diploma de universidad"
                    mutation={cadenaDiplomasMutation}
                    onEnviar={enviarCadena}
                    onContinuar={continuarCadena}
                  />
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 10: Datos del diploma universidad --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Diploma de universidad</h3>
                  <CampoFirmas
                    idPrefix="cadena-du"
                    items={FIRMAS_DIPLOMA_UNIVERSIDAD}
                    valores={diplomaUniversidadFirmas}
                    onCambiar={cambiarFirmaDiplomaUniversidad}
                  />
                  <Button onClick={() => continuarCadena(11)} className="w-fit">
                    Siguiente
                  </Button>
                </div>
              )}
            </CarouselItem>

            {/* --- Paso 11: Confirmación final -- unico lugar que muestra el resultado de
                "Finalizar y enviar", sin importar desde que Confirmacion se haya disparado
                (ver cadenaDiplomasMutation.onSuccess en useInscripcionForm). --- */}
            <CarouselItem className="overflow-y-auto">
              {accion === "crear" && (
                <div className="space-y-4">
                  {cadenaDiplomasMutation.isSuccess ? (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Cadena enviada</AlertTitle>
                      </Alert>
                      <ul className="space-y-1 text-sm">
                        {cadenaDiplomasMutation.data.diplomaPrimaria && (
                          <li>
                            Diploma de primaria #{cadenaDiplomasMutation.data.diplomaPrimaria.id} --{" "}
                            {cadenaDiplomasMutation.data.diplomaPrimaria.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                        {cadenaDiplomasMutation.data.inscripcionSecundaria && <li>Inscripción de secundaria creada.</li>}
                        {cadenaDiplomasMutation.data.diplomaSecundaria && (
                          <li>
                            Diploma de secundaria #{cadenaDiplomasMutation.data.diplomaSecundaria.id} --{" "}
                            {cadenaDiplomasMutation.data.diplomaSecundaria.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                        {cadenaDiplomasMutation.data.inscripcionUniversidad && <li>Inscripción de universidad creada.</li>}
                        {cadenaDiplomasMutation.data.diplomaUniversidad && (
                          <li>
                            Diploma de universidad #{cadenaDiplomasMutation.data.diplomaUniversidad.id} --{" "}
                            {cadenaDiplomasMutation.data.diplomaUniversidad.emitido ? "emitido" : "pendiente de firmas"}
                          </li>
                        )}
                      </ul>
                      <Button onClick={crearOtra} className="w-fit">
                        Crear otra solicitud
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium">Confirmación: diploma de universidad</h3>
                      <ResumenFirmas items={FIRMAS_DIPLOMA_UNIVERSIDAD} valores={diplomaUniversidadFirmas} />
                      <BotonesCadena hastaPaso={10} mutation={cadenaDiplomasMutation} onEnviar={enviarCadena} />
                    </>
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

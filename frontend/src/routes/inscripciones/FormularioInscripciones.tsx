import { useEffect, useRef, useState } from "react"
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

// Duracion de la animacion, en UN solo lugar: la usa el style (no una clase duration-*) y
// tambien el temporizador de seguridad de abajo. Si vivieran en dos lados y alguien cambiara
// solo uno, el temporizador cortaria la animacion a mitad de camino.
const DURACION_TRANSFORMACION_MS = 500

// ◽ RESUMEN -- LA ANIMACION (opcional): el fantasma que vuela del paso a su fila del resumen.
//
// BLINDADO a proposito, porque este componente se saca SOLO: mientras "transformacion" no
// vuelva a null (ver limpiarTransformacion), queda un div position:fixed z-50 del tamaño del
// formulario encima de TODA la app. Dos candados para que eso no pueda pasar:
//   1. un temporizador que lo saca aunque la transicion nunca arranque;
//   2. "pointer-events-none" (NO es cosmetico: sin eso, un fantasma pegado se come todos los
//      clicks y la app queda viva pero intocable).
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
  const terminadoRef = useRef(false)

  // Un solo "terminar": onTransitionEnd dispara UNA VEZ POR PROPIEDAD (top/left/width/height)
  // y el temporizador de abajo puede ganarles. Sin este candado, onTerminar corre 5 veces.
  function terminar() {
    if (terminadoRef.current) return
    terminadoRef.current = true
    onTerminar()
  }

  useEffect(() => {
    terminadoRef.current = false
    const cuadro = requestAnimationFrame(() => setRect(hasta))

    // Red de seguridad. onTransitionEnd puede NO llegar nunca: si el cambio de estilo cae en
    // el mismo frame que el montaje, si el usuario tiene prefers-reduced-motion, si la
    // pestaña estaba en segundo plano, o si el navegador decide que no hay nada que animar.
    // En todos esos casos el fantasma se quedaria fijo encima de la app para siempre.
    const limite = setTimeout(terminar, DURACION_TRANSFORMACION_MS + 150)

    return () => {
      cancelAnimationFrame(cuadro)
      clearTimeout(limite)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasta])

  return (
    <div
      aria-hidden
      onTransitionEnd={terminar}
      className="pointer-events-none fixed z-50 rounded-xl border bg-card shadow-2xl ring-foreground/20 ease-in-out"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        // Lista explicita en vez de "transition-all": transition-all tambien transiciona
        // propiedades que no cambian y dispara transitionend de mas.
        transitionProperty: "top, left, width, height",
        transitionDuration: `${DURACION_TRANSFORMACION_MS}ms`,
      }}
    />
  )
}

// 📌 PASOS DINAMICOS: sin paneles, el "siguiente" es el nivel de al lado, que puede no existir.
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
  const wizard = useInscripcionForm(formularioPagoRoute.useSearch())
  const {
    accion,
    empezarDeNuevo,
    // ◽ RESUMEN: todo este grupo.
    esEscritorio,
    resumenPanelRef,
    resumenColapsado,
    setResumenColapsado,
    alternarResumen,
    // cardRef: lo sigue exportando el hook, pero aca NO se desestructura porque la animacion
    // esta apagada y tsconfig tiene noUnusedLocals. Al prenderla, agregalo de vuelta.
    resumenRef,
    transformacion,
    limpiarTransformacion,
    current,
    maxStep,
    irAPaso,
    anterior,
    // 📌 PASOS DINAMICOS: todo este grupo.
    llevaPaneles,
    pasoDe,
    trasPaso,
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
    plantillasChecklist,
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
    seccionesResumen, // ◽ RESUMEN
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

  // ⭐ Mientras vuela el HTTP 2, la navegacion entera queda bloqueada (cadenaMutation.isPending).
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
    // ◽ RESUMEN: la animacion del fantasma esta APAGADA. Se prende con una sola linea,
    // "ref={cardRef}" aca -- el efecto que la dispara (ver useInscripcionForm) esta gateado
    // por "cardRef.current", asi que sin el ref enganchado no corre nada. "h-full" si hace
    // falta: el Card tiene que llenar el ResizablePanel de escritorio, y el 100% se resuelve
    // contra la cadena de alturas --alto-wizard-escritorio -> panel. Fuera de esa cadena
    // (otro proyecto, otro layout) "h-full" colapsa el Card.
    <Card className="h-full min-w-0">
      <CardContent>
        <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full" orientation="vertical">
          <CarouselContent className="h-(--alto-pasos-wizard)">
            <CarouselItem className="overflow-y-auto">
              {accion === "lista" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Inscripciones</h3>

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
                  {/* 🔳 CLONAR -- LA PANTALLA: todo el ternario de abajo (boton + selector). */}
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

                      {/* ⭐ Unico disparador del HTTP 1 (crear). */}
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

            {/* 📌 PASOS DINAMICOS: este paso solo existe en el ambiente principal. */}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistPrimariaAcciones.agregarVarias}
                      nivel={1}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistPrimariaAcciones.agregarVarias}
                      nivel={1}
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

            {/* 📌 PASOS DINAMICOS: este paso solo existe en el ambiente principal. */}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistSecundariaAcciones.agregarVarias}
                      nivel={2}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistSecundariaAcciones.agregarVarias}
                      nivel={2}
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

            {/* 📌 PASOS DINAMICOS: este paso solo existe en el ambiente principal. */}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistUniversidadAcciones.agregarVarias}
                      nivel={3}
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
                      plantillas={plantillasChecklist}
                      onAgregarVarias={checklistUniversidadAcciones.agregarVarias}
                      nivel={3}
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
      {/* ◽ RESUMEN -- EL LAYOUT: en escritorio, ResizablePanelGroup (resumen | formulario). */}
      {esEscritorio ? (
        <div className="h-(--alto-wizard-escritorio)">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel
              panelRef={resumenPanelRef}
              collapsible
              collapsedSize={PANEL_RESUMEN.colapsado}
              defaultSize={PANEL_RESUMEN.defecto}
              minSize={PANEL_RESUMEN.minimo}
              maxSize={PANEL_RESUMEN.maximo}
              onResize={(tamano) => setResumenColapsado(tamano.inPixels <= 0)}
            >
              {/* ◽ RESUMEN -- EL PANEL EN SI */}
              <ResumenCadena ref={resumenRef} secciones={seccionesResumen} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
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

      {/* ◽ RESUMEN -- LA ANIMACION */}
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

import { useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { formularioPagoRoute } from "@/router"
import {
  CampoCatalogo,
  CampoDatosProyecto,
  CampoResponsables,
  CampoSelect,
  CampoVistaDetalle,
  DetalleInscripcion,
  FormacionesComplementariasEditor,
  PasosNavegacion,
  useInscripcionForm,
} from "@/components/inscripcion-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeftIcon, CheckCircle2Icon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react"


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

  // "accion" llega por la URL (?accion=lista|crear|actualizar) -- la elige el submenu de
  // HomePage (ver PieMenu.tsx) ANTES de navegar aca. Si vino, arranca directo en esa
  // accion sin pasar por el paso 0 (desactivado mas abajo). Solo una vez por visita --
  // sin la guarda de accion === null, pisaria una eleccion manual si el usuario despues
  // usa "Empezar de nuevo" (ese vuelve a accion null, pero la URL seguiria con el search
  // param viejo).
  const { accion: accionInicial } = formularioPagoRoute.useSearch()
  useEffect(() => {
    if (accionInicial && accion === null) {
      elegirAccion(accionInicial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionInicial])

  return (
    <section className="max-w-2xl">
      <Button variant="outline" size="sm" className="mb-4" nativeButton={false} render={<Link to="/" />}>
        <ArrowLeftIcon />
        Volver al menú principal
      </Button>
      <h2>Solicitudes de inscripción</h2>
      <PasosNavegacion accion={accion} current={current} maxStep={maxStep} onIrAPaso={irAPaso} />

      <Card>
        <CardContent>
          <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full" orientation="vertical">
            <CarouselContent className="h-[min(70vh,36rem)]">
              {/* --- Paso 0: desactivado -- la accion ahora se elige en el submenu de
                  HomePage (ver PieMenu.tsx), antes de navegar aca (?accion=... en la URL,
                  leido arriba). Este paso queda vacio: con la accion ya puesta, el
                  carrusel arranca directo en el paso 1 y nunca se ve este. */}
              <CarouselItem className="overflow-y-auto" />

              {/* --- Paso 1 --- */}
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
                  <FieldGroup>
                    <FieldSet>
                      <FieldLabel>Catálogo</FieldLabel>
                      <CampoCatalogo
                        form={form}
                        idPrefix="pago-tf"
                        estadosQuery={estadosQuery}
                        sistemasQuery={sistemasQuery}
                        ambientesQuery={ambientesQuery}
                      />
                      <Button
                        onClick={() => {
                          desbloquearHasta(2)
                          api?.scrollTo(2)
                        }}
                        disabled={!catalogoCompleto}
                        className="w-fit"
                      >
                        Siguiente
                      </Button>
                    </FieldSet>
                  </FieldGroup>
                )}
              </CarouselItem>

              {/* --- Paso 2 --- */}
              <CarouselItem className="overflow-y-auto">
                {accion === "crear" && (
                  <FieldGroup>
                    <FieldSet>
                      <FieldLabel>Responsables</FieldLabel>
                      <FieldDescription>
                        Nunca se pide un id a mano -- se elige de una lista de nombres, y recién
                        al mandar la petición se traduce a las FK reales.
                      </FieldDescription>
                      <CampoResponsables form={form} idPrefix="pago-tf" responsablesQuery={responsablesQuery} />
                      <Button
                        onClick={() => {
                          desbloquearHasta(3)
                          api?.scrollTo(3)
                        }}
                        disabled={!responsablesCompletos}
                        className="w-fit"
                      >
                        Siguiente
                      </Button>
                    </FieldSet>
                  </FieldGroup>
                )}

                {accion === "actualizar" && (
                  <div className="space-y-4">
                    {!baseline ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Cargando solicitud…
                      </div>
                    ) : (
                      <>
                        <FieldGroup>
                          <FieldSet>
                            <CampoCatalogo
                              form={form}
                              idPrefix="pago-tf-edit"
                              estadosQuery={estadosQuery}
                              sistemasQuery={sistemasQuery}
                              ambientesQuery={ambientesQuery}
                              mostrarPlaceholder={false}
                            />
                            <CampoResponsables
                              form={form}
                              idPrefix="pago-tf-edit"
                              responsablesQuery={responsablesQuery}
                              mostrarPlaceholder={false}
                            />
                            <CampoDatosProyecto form={form} idPrefix="pago-tf-edit" mostrarEjemplos={false} />

                            <FormacionesComplementariasEditor
                              items={formacionesEditables}
                              onAgregar={agregarFormacionComplementariaEditable}
                              onCambiar={cambiarFormacionComplementariaEditable}
                              onQuitar={quitarFormacionComplementariaEditable}
                              descripcionAyuda="Lista 1:N ligada a esta solicitud -- podés agregar filas nuevas, borrar las que ya no hagan falta, o editar el texto de las existentes."
                            />

                            <Button
                              onClick={guardarCambios}
                              disabled={!hayAlgoQueGuardar || !formularioCompleto || actualizarInscripcionMutation.isPending}
                              className="w-fit"
                            >
                              Guardar cambios
                            </Button>
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
                          </FieldSet>
                        </FieldGroup>
                      </>
                    )}
                  </div>
                )}
              </CarouselItem>

              {/* --- Paso 3 --- */}
              <CarouselItem className="overflow-y-auto">
                {accion === "crear" && (
                  <FieldGroup>
                    <FieldSet>
                      <FieldLabel>Datos del proyecto</FieldLabel>
                      <CampoDatosProyecto form={form} idPrefix="pago-tf" />
                      <Button
                        onClick={() => {
                          desbloquearHasta(4)
                          api?.scrollTo(4)
                        }}
                        disabled={!datosProyectoCompletos}
                        className="w-fit"
                      >
                        Siguiente
                      </Button>
                    </FieldSet>
                  </FieldGroup>
                )}

                {accion === "actualizar" && (
                  <div className="space-y-4">
                    {guardadoConfirmado && buscarInscripcionMutation.data ? (
                      <>
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>Solicitud #{solicitudIdActual} actualizada</AlertTitle>
                        </Alert>
                        <DetalleInscripcion inscripcion={buscarInscripcionMutation.data} />
                        <Button onClick={actualizarOtra} className="w-fit">
                          Actualizar otra solicitud
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Todavía no guardaste ningún cambio.</p>
                    )}
                  </div>
                )}
              </CarouselItem>

              {/* --- Paso 4 (solo "crear") --- */}
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

                        <Button onClick={crearOtra} className="w-fit">
                          Crear otra solicitud
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium">Revisá antes de finalizar</h3>
                        <DetalleInscripcion inscripcion={camposAVistaPrevia(campos)} />

                        <FormacionesComplementariasEditor
                          items={formacionesNuevas}
                          onAgregar={agregarFormacionNueva}
                          onCambiar={cambiarFormacionNueva}
                          onQuitar={quitarFormacionNueva}
                          descripcionAyuda="Opcional -- se crean automáticamente después de la solicitud, ya con su id real como referencia."
                        />

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
    </section>
  )
}
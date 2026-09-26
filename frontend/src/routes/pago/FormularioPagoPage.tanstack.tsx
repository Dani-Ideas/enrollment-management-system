import { Link } from "@tanstack/react-router"
import {
  CampoCatalogo,
  CampoDatosProyecto,
  CampoResponsables,
  DetalleInscripcion,
  FormacionesComplementariasEditor,
  PasosNavegacion,
  useInscripcionForm,
} from "@/components/inscripcion-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react"

// ============================================================================
// VARIANTE con TanStack Form -- copia funcional de FormularioPagoPage.tsx, NO
// registrada en router.tsx a proposito (no es una ruta real, es material de
// referencia). Toda la logica NO visual (carrusel, formulario, catalogos,
// mutations, formaciones complementarias) vive en useInscripcionForm() --
// este archivo comparte ese hook y los sub-componentes de campos con
// InscripcionWizard.tanstack.tsx, asi que solo queda el JSX propio de ESTA
// presentacion (sin la rama "lista" que si tiene InscripcionWizard).
// ============================================================================

export function FormularioPagoPageTanstack() {
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
    catalogoCompleto,
    responsablesCompletos,
    datosProyectoCompletos,
    formularioCompleto,
    estadosQuery,
    sistemasQuery,
    responsablesQuery,
    ambientesQuery,
    useInscripciones,
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
    formacionesQuery,
    formacionesEditables,
    agregarFormacionComplementariaEditable,
    cambiarFormacionComplementariaEditable,
    quitarFormacionComplementariaEditable,
    hayAlgoQueGuardar,
    actualizarInscripcionMutation,
    sincronizarFormacionesMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
  } = wizard

  const inscripcionesQuery = useInscripciones()

  return (
    <section className="max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link to="/">
          <ArrowLeftIcon />
          Volver al menú principal
        </Link>
      </Button>

      <h2>Solicitudes de inscripción (variante TanStack Form)</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Elegí si querés crear una solicitud nueva o actualizar una existente -- el
        formulario te va guiando paso a paso.
      </p>

      <PasosNavegacion accion={accion} current={current} maxStep={maxStep} onIrAPaso={irAPaso} />

      <Card>
        <CardContent>
          <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full">
            <CarouselContent>
              {/* --- Paso 0: elegir que hacer --- */}
              <CarouselItem>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => elegirAccion("crear")}
                    className="flex flex-col items-center gap-2 rounded-lg border border-input p-4 text-sm hover:border-primary/40 hover:bg-primary/5"
                  >
                    <PlusIcon className="size-5" />
                    Crear una solicitud nueva
                  </button>
                  <button
                    type="button"
                    onClick={() => elegirAccion("actualizar")}
                    className="flex flex-col items-center gap-2 rounded-lg border border-input p-4 text-sm hover:border-primary/40 hover:bg-primary/5"
                  >
                    <PencilIcon className="size-5" />
                    Actualizar una solicitud existente
                  </button>
                </div>
              </CarouselItem>

              {/* --- Paso 1 --- */}
              <CarouselItem>
                {accion === "actualizar" && (
                  <div className="space-y-4">
                    <FieldGroup>
                      <FieldLabel htmlFor="pago-tf-buscar-id">Número de solicitud</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="pago-tf-buscar-id"
                          type="number"
                          min="1"
                          value={listaIdInput}
                          onChange={(e) => setListaIdInput(e.target.value)}
                          placeholder="Ej. 1"
                        />
                        <Button
                          onClick={buscarPorIdInput}
                          disabled={buscarInscripcionMutation.isPending || listaIdInput.trim() === ""}
                        >
                          <SearchIcon />
                          Buscar
                        </Button>
                      </div>
                      <FieldDescription>O elegí una directamente de la lista de abajo.</FieldDescription>
                    </FieldGroup>

                    {buscarInscripcionMutation.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se encontró esa solicitud</AlertTitle>
                        <AlertDescription>Revisá el número e intentá de nuevo.</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      {inscripcionesQuery.isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner /> Cargando lista…
                        </div>
                      )}
                      {inscripcionesQuery.data?.map((inscripcion) => (
                        <button
                          key={inscripcion.id}
                          type="button"
                          onClick={() => elegirSolicitud(inscripcion.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-input p-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5"
                        >
                          <span>
                            #{inscripcion.id} · {inscripcion.proyecto} ({inscripcion.version})
                          </span>
                          <span className="text-xs text-muted-foreground">{inscripcion.estado}</span>
                        </button>
                      ))}
                    </div>
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
              <CarouselItem>
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
                        <p className="text-sm text-muted-foreground">
                          Editando la solicitud #{solicitudIdActual}. Ya está precargada con lo
                          que tenía antes -- modificá lo que haga falta, el botón de guardar
                          recién se habilita si cambió algo.
                        </p>
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
                              cargando={formacionesQuery.isLoading}
                            />

                            <Button
                              onClick={guardarCambios}
                              disabled={
                                !hayAlgoQueGuardar ||
                                !formularioCompleto ||
                                actualizarInscripcionMutation.isPending ||
                                sincronizarFormacionesMutation.isPending
                              }
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
                            {sincronizarFormacionesMutation.isError && (
                              <Alert variant="destructive">
                                <TriangleAlertIcon />
                                <AlertTitle>No se pudieron guardar las formaciones complementarias</AlertTitle>
                                <AlertDescription>
                                  {(sincronizarFormacionesMutation.error as Error).message}
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
              <CarouselItem>
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
              <CarouselItem>
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
                        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                          <dt className="text-muted-foreground">Estado</dt>
                          <dd>{estadosQuery.data?.find((e) => String(e.id) === campos.estadoId)?.estado}</dd>
                          <dt className="text-muted-foreground">Sistema</dt>
                          <dd>{sistemasQuery.data?.find((s) => String(s.id) === campos.sistemaId)?.nombre}</dd>
                          <dt className="text-muted-foreground">Ambiente</dt>
                          <dd>{ambientesQuery.data?.find((a) => String(a.id) === campos.ambienteId)?.nombre}</dd>
                          <dt className="text-muted-foreground">Proyecto</dt>
                          <dd>{campos.proyecto}</dd>
                          <dt className="text-muted-foreground">Versión</dt>
                          <dd>{campos.version}</dd>
                          <dt className="text-muted-foreground">Fecha planteada</dt>
                          <dd>{campos.fechaPlanteada}</dd>
                        </dl>

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
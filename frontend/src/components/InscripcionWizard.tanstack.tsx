import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchFormacionesComplementariasPorInscripcion } from "@/api/client"
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
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react"

// ============================================================================
// VARIANTE con TanStack Form -- copia funcional de InscripcionWizard.tsx, NO
// registrada en router.tsx a proposito (no es una ruta real, es material de
// referencia). Comparte useInscripcionForm() y los sub-componentes de campos
// con FormularioPagoPage.tanstack.tsx -- lo unico exclusivo de ESTE archivo
// es la rama "lista" (filtros + "Ver detalle"), que vive como estado local
// aca porque FormularioPagoPage.tanstack.tsx nunca la usa.
// ============================================================================

export function InscripcionWizardTanstack() {
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
    camposADto,
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
    crearFormacionesMutation,
    crearInscripcionMutation,
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

  // --- Exclusivo de este wizard: filtros de la rama "lista" y "Ver detalle" ---
  const [filtroEstadoId, setFiltroEstadoId] = useState("")
  const [filtroSistemaId, setFiltroSistemaId] = useState("")
  const [filtroAmbienteId, setFiltroAmbienteId] = useState("")

  const [detalleAbiertoId, setDetalleAbiertoId] = useState<number | null>(null)
  function alternarDetalle(id: number) {
    setDetalleAbiertoId((actual) => (actual === id ? null : id))
  }
  const detalleFormacionesQuery = useQuery({
    queryKey: ["formaciones-complementarias", detalleAbiertoId],
    queryFn: () => fetchFormacionesComplementariasPorInscripcion(detalleAbiertoId!),
    enabled: detalleAbiertoId !== null,
  })

  const inscripcionesQuery = useInscripciones({
    estadoId: filtroEstadoId,
    sistemaId: filtroSistemaId,
    ambienteId: filtroAmbienteId,
  })

  function empezarDeNuevoCompleto() {
    empezarDeNuevo()
    setFiltroEstadoId("")
    setFiltroSistemaId("")
    setFiltroAmbienteId("")
    setDetalleAbiertoId(null)
  }

  return (
    <div className="space-y-4">
      <PasosNavegacion accion={accion} current={current} maxStep={maxStep} onIrAPaso={irAPaso} />

      <Card>
        <CardContent>
          <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full">
            <CarouselContent>
              {/* --- Paso 0 --- */}
              <CarouselItem>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => elegirAccion("lista")}
                    className="flex flex-col items-center gap-2 rounded-lg border border-input p-4 text-sm hover:border-primary/40 hover:bg-primary/5"
                  >
                    <ListIcon className="size-5" />
                    Ver solicitudes existentes
                  </button>
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
                    Actualizar una solicitud
                  </button>
                </div>
              </CarouselItem>

              {/* --- Paso 1 --- */}
              <CarouselItem>
                {accion === "lista" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Solicitudes existentes</h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="tf-filtro-estado">Estado</FieldLabel>
                        <NativeSelect
                          id="tf-filtro-estado"
                          value={filtroEstadoId}
                          onChange={(e) => setFiltroEstadoId(e.target.value)}
                        >
                          <option value="">Todos</option>
                          {estadosQuery.data?.map((es) => (
                            <option key={es.id} value={es.id}>
                              {es.estado}
                            </option>
                          ))}
                        </NativeSelect>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="tf-filtro-sistema">Sistema</FieldLabel>
                        <NativeSelect
                          id="tf-filtro-sistema"
                          value={filtroSistemaId}
                          onChange={(e) => setFiltroSistemaId(e.target.value)}
                        >
                          <option value="">Todos</option>
                          {sistemasQuery.data?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre}
                            </option>
                          ))}
                        </NativeSelect>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="tf-filtro-ambiente">Ambiente</FieldLabel>
                        <NativeSelect
                          id="tf-filtro-ambiente"
                          value={filtroAmbienteId}
                          onChange={(e) => setFiltroAmbienteId(e.target.value)}
                        >
                          <option value="">Todos</option>
                          {ambientesQuery.data?.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </NativeSelect>
                      </Field>
                    </div>

                    {inscripcionesQuery.isLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Cargando…
                      </div>
                    )}
                    {inscripcionesQuery.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se pudo cargar la lista</AlertTitle>
                        <AlertDescription>{(inscripcionesQuery.error as Error).message}</AlertDescription>
                      </Alert>
                    )}
                    {inscripcionesQuery.data?.length === 0 && (
                      <Alert>
                        <TriangleAlertIcon />
                        <AlertTitle>
                          {filtroEstadoId || filtroSistemaId || filtroAmbienteId
                            ? "Ninguna solicitud coincide con esos filtros"
                            : "Todavía no hay solicitudes cargadas"}
                        </AlertTitle>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      {inscripcionesQuery.data?.map((inscripcion) => {
                        const abierto = detalleAbiertoId === inscripcion.id
                        return (
                          <div key={inscripcion.id} className="rounded-lg border border-input p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">
                                #{inscripcion.id} · {inscripcion.proyecto} ({inscripcion.version}) ·{" "}
                                {inscripcion.estado}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => alternarDetalle(inscripcion.id)}
                              >
                                {abierto ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                Ver detalle
                              </Button>
                            </div>
                            {abierto && (
                              <div className="mt-3 space-y-3 border-t border-dashed border-input pt-3">
                                <DetalleInscripcion inscripcion={inscripcion} />
                                <div>
                                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                                    Formaciones complementarias
                                  </p>
                                  {detalleFormacionesQuery.isLoading && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Spinner /> Cargando formaciones complementarias…
                                    </div>
                                  )}
                                  {detalleFormacionesQuery.isError && (
                                    <p className="text-sm text-destructive">
                                      No se pudieron cargar las formaciones complementarias.
                                    </p>
                                  )}
                                  {detalleFormacionesQuery.data?.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sin formaciones complementarias.</p>
                                  )}
                                  <ul className="list-disc space-y-1 pl-5">
                                    {detalleFormacionesQuery.data?.map((formacion) => (
                                      <li key={formacion.id} className="text-sm">
                                        {formacion.descripcion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Button variant="outline" onClick={empezarDeNuevoCompleto} className="w-fit">
                      <RotateCcwIcon />
                      Elegir otra acción
                    </Button>
                  </div>
                )}

                {accion === "actualizar" && (
                  <div className="space-y-4">
                    <FieldGroup>
                      <FieldLabel htmlFor="tf-wizard-buscar-id">Número de solicitud</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="tf-wizard-buscar-id"
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
                        idPrefix="tf-wizard"
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
                      <CampoResponsables form={form} idPrefix="tf-wizard" responsablesQuery={responsablesQuery} />
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
                          Editando la solicitud #{solicitudIdActual}. Modificá lo que haga falta --
                          el botón de guardar recién se habilita si cambió algo.
                        </p>
                        <FieldGroup>
                          <FieldSet>
                            <CampoCatalogo
                              form={form}
                              idPrefix="tf-wizard-edit"
                              estadosQuery={estadosQuery}
                              sistemasQuery={sistemasQuery}
                              ambientesQuery={ambientesQuery}
                              mostrarPlaceholder={false}
                            />
                            <CampoResponsables
                              form={form}
                              idPrefix="tf-wizard-edit"
                              responsablesQuery={responsablesQuery}
                              mostrarPlaceholder={false}
                            />
                            <CampoDatosProyecto form={form} idPrefix="tf-wizard-edit" mostrarEjemplos={false} />

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
                      <CampoDatosProyecto form={form} idPrefix="tf-wizard" />
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
                          <AlertTitle>Solicitud #{crearInscripcionMutation.data.id} creada</AlertTitle>
                        </Alert>
                        <DetalleInscripcion inscripcion={crearInscripcionMutation.data} />

                        {crearFormacionesMutation.isPending && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spinner /> Creando formaciones complementarias…
                          </div>
                        )}
                        {crearFormacionesMutation.isSuccess && crearFormacionesMutation.data.length > 0 && (
                          <Alert>
                            <CheckCircle2Icon />
                            <AlertTitle>
                              {crearFormacionesMutation.data.length} formación
                              {crearFormacionesMutation.data.length === 1 ? "" : "es"} complementaria
                              {crearFormacionesMutation.data.length === 1 ? "" : "s"} creada
                              {crearFormacionesMutation.data.length === 1 ? "" : "s"}
                            </AlertTitle>
                          </Alert>
                        )}
                        {crearFormacionesMutation.isError && (
                          <Alert variant="destructive">
                            <TriangleAlertIcon />
                            <AlertTitle>La solicitud se creó, pero fallaron las formaciones complementarias</AlertTitle>
                            <AlertDescription>{(crearFormacionesMutation.error as Error).message}</AlertDescription>
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
                          onClick={() => crearInscripcionMutation.mutate(camposADto(campos))}
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
            <Button variant="outline" onClick={empezarDeNuevoCompleto} size="sm">
              <RotateCcwIcon />
              Empezar de nuevo
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

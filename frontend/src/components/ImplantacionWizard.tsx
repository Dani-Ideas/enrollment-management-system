import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  actualizarImplantacion,
  crearImplantacion,
  fetchImplantacion,
  fetchImplantaciones,
  fetchTablasImplantacion,
} from "@/api/client"
import type { ImplantacionDTO, ImplantacionRequestDTO } from "@/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  CheckCircle2Icon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react"

type Accion = "lista" | "crear" | "actualizar"

// Campos del formulario en su forma "de UI": todo como string (lo que dan los
// <input>/<select> nativos), incluidas las FK -- recien se convierten a
// numero/ImplantacionRequestDTO en el momento de mandar la peticion (ver
// camposADto mas abajo). Se comparte una sola forma entre "crear" y
// "actualizar" porque son, ni mas ni menos, los mismos 11 campos del mismo
// ImplantacionRequestDTO -- no hay motivo para dos tipos distintos.
interface CamposFormulario {
  estadoId: string
  sistemaId: string
  responsableProyectoId: string
  responsableDesarrolloId: string
  responsableImplantacionId: string
  ambienteId: string
  proyecto: string
  version: string
  descripcion: string
  fechaPlanteada: string
  fechaReal: string
}

const CAMPOS_VACIOS: CamposFormulario = {
  estadoId: "",
  sistemaId: "",
  responsableProyectoId: "",
  responsableDesarrolloId: "",
  responsableImplantacionId: "",
  ambienteId: "",
  proyecto: "",
  version: "",
  descripcion: "",
  fechaPlanteada: "",
  fechaReal: "",
}

// El backend guarda LocalDateTime ("2026-03-01T10:00:00"), el input
// type="datetime-local" solo entiende hasta el minuto ("2026-03-01T10:00") --
// de ahi y para alla, truncar/pasar tal cual alcanza (el backend acepta
// LocalDateTime sin segundos igual).
function aInputDatetime(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ""
}

// PASOS visibles por rama -- el paso 0 ("Elegir accion") es comun a las tres.
// El Carousel de abajo SIEMPRE tiene 5 CarouselItem (el maximo que necesita
// la rama mas larga, "crear"): mantener la CANTIDAD de slides fija de
// entrada a la salida evita que Embla (la libreria detras del Carousel de
// shadcn) tenga que re-detectar slides nuevos a mitad de sesion -- en vez de
// eso, el contenido de cada slide cambia segun "accion", pero la cantidad de
// slides jamas cambia. Las ramas mas cortas ("lista": 1 paso extra,
// "actualizar": 3) simplemente nunca desbloquean mas alla de su ultimo paso
// real.
function etiquetaPaso(accion: Accion | null, indice: number): string {
  if (indice === 0) return "Elegir acción"
  if (accion === "lista") return indice === 1 ? "Lista de solicitudes" : ""
  if (accion === "actualizar") {
    return (
      { 1: "Elegir solicitud", 2: "Editar campos", 3: "Confirmación" }[indice] ?? ""
    )
  }
  if (accion === "crear") {
    return (
      { 1: "Catálogo", 2: "Responsables", 3: "Datos del proyecto", 4: "Confirmación" }[
        indice
      ] ?? ""
    )
  }
  return ""
}

function totalPasos(accion: Accion | null): number {
  if (accion === "lista") return 2
  if (accion === "actualizar") return 4
  if (accion === "crear") return 5
  return 1
}

function renderDetalle(implantacion: ImplantacionDTO) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      <dt className="text-muted-foreground">Proyecto</dt>
      <dd>{implantacion.proyecto}</dd>
      <dt className="text-muted-foreground">Versión</dt>
      <dd>{implantacion.version}</dd>
      <dt className="text-muted-foreground">Estado</dt>
      <dd>{implantacion.estado}</dd>
      <dt className="text-muted-foreground">Sistema</dt>
      <dd>{implantacion.sistema}</dd>
      <dt className="text-muted-foreground">Ambiente</dt>
      <dd>{implantacion.ambiente}</dd>
      <dt className="text-muted-foreground">Responsable de proyecto</dt>
      <dd>{implantacion.responsableProyecto}</dd>
      <dt className="text-muted-foreground">Responsable de desarrollo</dt>
      <dd>{implantacion.responsableDesarrollo}</dd>
      <dt className="text-muted-foreground">Responsable de implantación</dt>
      <dd>{implantacion.responsableImplantacion}</dd>
      <dt className="text-muted-foreground">Fecha planteada</dt>
      <dd>{implantacion.fechaImplantacionPlanteada}</dd>
      {implantacion.fechaImplantacionReal && (
        <>
          <dt className="text-muted-foreground">Fecha real</dt>
          <dd>{implantacion.fechaImplantacionReal}</dd>
        </>
      )}
      {implantacion.descripcion && (
        <>
          <dt className="text-muted-foreground">Descripción</dt>
          <dd>{implantacion.descripcion}</dd>
        </>
      )}
    </dl>
  )
}

// ============================================================================
// Wizard en carrusel para el dominio "solicitud/implantacion", exclusivo de
// FormularioLargoPage.tsx -- FormularioPagoPage.tsx tiene su PROPIA version
// de este mismo flujo (sin la rama "lista"), integrada directo en su propio
// Carousel en vez de delegar a este componente: son dos presentaciones
// distintas del mismo dominio (esta incluye "ver lista", la otra no), asi
// que no comparten componente aunque la logica interna sea casi identica.
// Primero pregunta QUE se quiere hacer (ver lista / crear / actualizar) y
// recien ahi arma el
// resto de los pasos -- cada eleccion es en si misma un avance de carrusel,
// igual que "buscar estudiante" o "elegir materia" en el flujo academico de
// FormularioPagoPage.tsx: el usuario nunca "swipea" para avanzar, un
// backend real (o una validacion de formulario) tiene que confirmar cada
// paso primero.
// ============================================================================
export function ImplantacionWizard() {
  const queryClient = useQueryClient()

  const [accion, setAccion] = useState<Accion | null>(null)

  // --- Mecanica del carrusel (identica a FormularioPagoPage.tsx, ver los
  // comentarios de ese archivo para el detalle de por que hacen falta los
  // refs ademas del estado) ---
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const maxStepRef = useRef(0)
  const currentRef = useRef(0)

  function desbloquearHasta(destino: number) {
    maxStepRef.current = Math.max(maxStepRef.current, destino)
    setMaxStep(maxStepRef.current)
  }

  useEffect(() => {
    if (!api) return
    function onSelect() {
      const indice = api!.selectedScrollSnap()
      if (indice > maxStepRef.current) {
        api!.scrollTo(maxStepRef.current)
        return
      }
      currentRef.current = indice
      setCurrent(indice)
    }
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  function irAPaso(indice: number) {
    if (indice > maxStepRef.current) return
    api?.scrollTo(indice)
  }

  function anterior() {
    api?.scrollTo(Math.max(current - 1, 0))
  }

  // --- Formulario compartido (crear Y editar usan los mismos 11 campos) ---
  const [campos, setCampos] = useState<CamposFormulario>(CAMPOS_VACIOS)
  function setCampo<K extends keyof CamposFormulario>(campo: K, valor: string) {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  function camposADto(c: CamposFormulario): ImplantacionRequestDTO {
    return {
      estadoId: Number(c.estadoId),
      sistemaId: Number(c.sistemaId),
      responsableProyectoId: Number(c.responsableProyectoId),
      responsableDesarrolloId: Number(c.responsableDesarrolloId),
      responsableImplantacionId: Number(c.responsableImplantacionId),
      ambienteId: Number(c.ambienteId),
      proyecto: c.proyecto,
      version: c.version,
      descripcion: c.descripcion.trim() === "" ? null : c.descripcion,
      fechaImplantacionPlanteada: c.fechaPlanteada,
      fechaImplantacionReal: c.fechaReal.trim() === "" ? null : c.fechaReal,
    }
  }

  // Validez por sub-paso (se reutiliza tal cual entre "crear", donde cada
  // grupo es un CarouselItem propio, y "actualizar", donde los tres grupos
  // conviven en un unico paso "Editar campos").
  const catalogoCompleto = campos.estadoId !== "" && campos.sistemaId !== "" && campos.ambienteId !== ""
  const responsablesCompletos =
    campos.responsableProyectoId !== "" &&
    campos.responsableDesarrolloId !== "" &&
    campos.responsableImplantacionId !== ""
  const datosProyectoCompletos =
    campos.proyecto.trim() !== "" && campos.version.trim() !== "" && campos.fechaPlanteada !== ""
  const formularioCompleto = catalogoCompleto && responsablesCompletos && datosProyectoCompletos

  function empezarDeNuevo() {
    setAccion(null)
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    setCampos(CAMPOS_VACIOS)
    setBaseline(null)
    setSolicitudIdActual(null)
    baselineIdRef.current = null
    setListaIdInput("")
    buscarImplantacionMutation.reset()
    crearImplantacionMutation.reset()
    actualizarImplantacionMutation.reset()
  }

  function elegirAccion(nueva: Accion) {
    setAccion(nueva)
    desbloquearHasta(1)
    api?.scrollTo(1)
  }

  // --- Catalogos para los <select> -- solo se piden si hacen falta (crear o
  // actualizar), nunca en "lista" (ahi no hay ningun formulario que llenar).
  const catalogosHabilitados = accion === "crear" || accion === "actualizar"
  const estadosQuery = useQuery({
    queryKey: ["estados"],
    queryFn: fetchEstados,
    enabled: catalogosHabilitados,
    staleTime: 5 * 60 * 1000,
  })
  const sistemasQuery = useQuery({
    queryKey: ["sistemas"],
    queryFn: fetchSistemas,
    enabled: catalogosHabilitados,
    staleTime: 5 * 60 * 1000,
  })
  const responsablesQuery = useQuery({
    queryKey: ["responsables"],
    queryFn: fetchResponsables,
    enabled: catalogosHabilitados,
    staleTime: 5 * 60 * 1000,
  })
  const ambientesQuery = useQuery({
    queryKey: ["ambientes"],
    queryFn: fetchAmbientes,
    enabled: catalogosHabilitados,
    staleTime: 5 * 60 * 1000,
  })
  const catalogosListos =
    estadosQuery.isSuccess && sistemasQuery.isSuccess && responsablesQuery.isSuccess && ambientesQuery.isSuccess

  // --- Lista completa -- usada por "lista" (mostrar todo) y por
  // "actualizar" (elegir de que solicitud partir). staleTime corto (10s):
  // a diferencia de los catalogos de arriba, esta es la lista de las
  // SOLICITUDES mismas, que es justo lo que este componente crea/edita.
  const implantacionesQuery = useQuery({
    queryKey: ["implantaciones"],
    queryFn: fetchImplantaciones,
    enabled: accion === "lista" || accion === "actualizar",
    staleTime: 10 * 1000,
  })

  // --- Crear: POST /implantaciones ---
  const crearImplantacionMutation = useMutation({
    mutationFn: crearImplantacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["implantaciones"] })
      desbloquearHasta(4)
      api?.scrollTo(4)
    },
  })

  function crearOtra() {
    setCampos(CAMPOS_VACIOS)
    crearImplantacionMutation.reset()
    maxStepRef.current = 1
    setMaxStep(1)
    api?.scrollTo(1)
  }

  // --- Actualizar: elegir la solicitud, despues editarla ---
  const [listaIdInput, setListaIdInput] = useState("")
  const [solicitudIdActual, setSolicitudIdActual] = useState<number | null>(null)
  const [baseline, setBaseline] = useState<CamposFormulario | null>(null)
  const baselineIdRef = useRef<number | null>(null)

  const buscarImplantacionMutation = useMutation({ mutationFn: fetchImplantacion })

  function elegirSolicitud(id: number) {
    setSolicitudIdActual(id)
    buscarImplantacionMutation.mutate(id)
  }

  function buscarPorIdInput() {
    const id = Number(listaIdInput)
    if (!Number.isInteger(id) || id <= 0) return
    elegirSolicitud(id)
  }

  // Una vez que llega la solicitud elegida Y los 4 catalogos ya estan
  // cargados, se arma el "baseline": los mismos 11 campos pero resueltos a
  // partir del DTO (que trae texto, no ids -- ImplantacionDTO esta aplanado
  // a proposito, ver ImplantacionMapper.java). Resolver el id a partir del
  // nombre asume nombres unicos por catalogo (cierto con los datos
  // sembrados); es la contrapartida de mostrarle al usuario un <select> con
  // nombres legibles en vez de pedirle que "llene una FK a mano".
  // baselineIdRef evita recalcular/rebotar al paso 2 de nuevo si el efecto
  // se re-ejecuta por otro motivo (p.ej. los catalogos terminan de cargar
  // despues que la solicitud) para la MISMA solicitud ya inicializada.
  useEffect(() => {
    if (accion !== "actualizar") return
    if (!buscarImplantacionMutation.isSuccess || !catalogosListos) return
    if (baselineIdRef.current === solicitudIdActual) return
    baselineIdRef.current = solicitudIdActual

    const dto = buscarImplantacionMutation.data
    const nuevoBaseline: CamposFormulario = {
      estadoId: String(estadosQuery.data!.find((e) => e.estado === dto.estado)?.id ?? ""),
      sistemaId: String(sistemasQuery.data!.find((s) => s.nombre === dto.sistema)?.id ?? ""),
      responsableProyectoId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.responsableProyecto)?.id ?? "",
      ),
      responsableDesarrolloId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.responsableDesarrollo)?.id ?? "",
      ),
      responsableImplantacionId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.responsableImplantacion)?.id ?? "",
      ),
      ambienteId: String(ambientesQuery.data!.find((a) => a.nombre === dto.ambiente)?.id ?? ""),
      proyecto: dto.proyecto,
      version: dto.version,
      descripcion: dto.descripcion ?? "",
      fechaPlanteada: aInputDatetime(dto.fechaImplantacionPlanteada),
      fechaReal: aInputDatetime(dto.fechaImplantacionReal),
    }
    setBaseline(nuevoBaseline)
    setCampos(nuevoBaseline)
    desbloquearHasta(2)
    api?.scrollTo(2)
    // Deliberadamente no se listan estadosQuery.data/etc. como dependencias
    // (ya se leen adentro via catalogosListos, que si es dependencia) -- son
    // objetos nuevos en cada refetch aunque el contenido no cambie, listarlos
    // dispararia el efecto de mas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, buscarImplantacionMutation.isSuccess, buscarImplantacionMutation.data, catalogosListos, solicitudIdActual])

  // El boton de guardar SOLO se habilita si hay un cambio real -- comparar
  // contra el baseline campo por campo (JSON.stringify alcanza: es un objeto
  // plano de 11 strings, siempre en el mismo orden de claves).
  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)

  const actualizarImplantacionMutation = useMutation({
    mutationFn: (dto: ImplantacionRequestDTO) => actualizarImplantacion(solicitudIdActual!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["implantaciones"] })
      desbloquearHasta(3)
      api?.scrollTo(3)
    },
  })

  function guardarCambios() {
    if (!huboCambios || !formularioCompleto) return
    actualizarImplantacionMutation.mutate(camposADto(campos))
  }

  function actualizarOtra() {
    setSolicitudIdActual(null)
    setBaseline(null)
    baselineIdRef.current = null
    setCampos(CAMPOS_VACIOS)
    setListaIdInput("")
    buscarImplantacionMutation.reset()
    actualizarImplantacionMutation.reset()
    maxStepRef.current = 1
    setMaxStep(1)
    api?.scrollTo(1)
  }

  const pasos = Array.from({ length: totalPasos(accion) }, (_, i) => etiquetaPaso(accion, i))

  return (
    <div className="space-y-4">
      <NavigationMenu viewport={false} className="max-w-none justify-start">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {pasos.map((titulo, indice) => {
            const desbloqueado = indice <= maxStep
            const esActual = indice === current
            return (
              <NavigationMenuItem key={indice}>
                <button
                  type="button"
                  disabled={!desbloqueado}
                  onClick={() => irAPaso(indice)}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    esActual && "bg-muted font-semibold text-foreground",
                    !desbloqueado && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-xs",
                      esActual ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {indice + 1}
                  </span>
                  {titulo}
                </button>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>

      <Card>
        <CardContent>
          {/* watchDrag: false -- igual que en FormularioPagoPage.tsx, el
              avance solo lo dispara el codigo (nunca el swipe/arrastre). */}
          <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full">
            <CarouselContent>
              {/* --- Paso 0: elegir que hacer (siempre presente) --- */}
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
                    {implantacionesQuery.isLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Cargando…
                      </div>
                    )}
                    {implantacionesQuery.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se pudo cargar la lista</AlertTitle>
                        <AlertDescription>
                          {(implantacionesQuery.error as Error).message}
                        </AlertDescription>
                      </Alert>
                    )}
                    {implantacionesQuery.data?.length === 0 && (
                      <Alert>
                        <TriangleAlertIcon />
                        <AlertTitle>Todavía no hay solicitudes cargadas</AlertTitle>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      {implantacionesQuery.data?.map((implantacion) => (
                        <div key={implantacion.id} className="rounded-lg border border-input p-3">
                          <p className="text-sm font-medium">
                            #{implantacion.id} · {implantacion.proyecto} ({implantacion.version})
                          </p>
                          {renderDetalle(implantacion)}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={empezarDeNuevo} className="w-fit">
                      <RotateCcwIcon />
                      Elegir otra acción
                    </Button>
                  </div>
                )}

                {accion === "actualizar" && (
                  <div className="space-y-4">
                    <FieldGroup>
                      <FieldLabel htmlFor="wizard-buscar-id">Número de solicitud</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="wizard-buscar-id"
                          type="number"
                          min="1"
                          value={listaIdInput}
                          onChange={(e) => setListaIdInput(e.target.value)}
                          placeholder="Ej. 1"
                        />
                        <Button
                          onClick={buscarPorIdInput}
                          disabled={buscarImplantacionMutation.isPending || listaIdInput.trim() === ""}
                        >
                          <SearchIcon />
                          Buscar
                        </Button>
                      </div>
                      <FieldDescription>
                        O elegí una directamente de la lista de abajo.
                      </FieldDescription>
                    </FieldGroup>

                    {buscarImplantacionMutation.isError && (
                      <Alert variant="destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>No se encontró esa solicitud</AlertTitle>
                        <AlertDescription>Revisá el número e intentá de nuevo.</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      {implantacionesQuery.isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner /> Cargando lista…
                        </div>
                      )}
                      {implantacionesQuery.data?.map((implantacion) => (
                        <button
                          key={implantacion.id}
                          type="button"
                          onClick={() => elegirSolicitud(implantacion.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-input p-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5"
                        >
                          <span>
                            #{implantacion.id} · {implantacion.proyecto} ({implantacion.version})
                          </span>
                          <span className="text-xs text-muted-foreground">{implantacion.estado}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {accion === "crear" && (
                  <FieldGroup>
                    <FieldSet>
                      <FieldLabel>Catálogo</FieldLabel>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="wizard-estado">Estado</FieldLabel>
                          <NativeSelect
                            id="wizard-estado"
                            value={campos.estadoId}
                            onChange={(e) => setCampo("estadoId", e.target.value)}
                          >
                            <option value="">
                              {estadosQuery.isLoading ? "Cargando…" : "Seleccioná un estado…"}
                            </option>
                            {estadosQuery.data?.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.estado}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="wizard-sistema">Sistema</FieldLabel>
                          <NativeSelect
                            id="wizard-sistema"
                            value={campos.sistemaId}
                            onChange={(e) => setCampo("sistemaId", e.target.value)}
                          >
                            <option value="">
                              {sistemasQuery.isLoading ? "Cargando…" : "Seleccioná un sistema…"}
                            </option>
                            {sistemasQuery.data?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="wizard-ambiente">Ambiente</FieldLabel>
                          <NativeSelect
                            id="wizard-ambiente"
                            value={campos.ambienteId}
                            onChange={(e) => setCampo("ambienteId", e.target.value)}
                          >
                            <option value="">
                              {ambientesQuery.isLoading ? "Cargando…" : "Seleccioná un ambiente…"}
                            </option>
                            {ambientesQuery.data?.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.nombre}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                      </div>
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
                        Nunca se pide un id a mano -- se elige de una lista de nombres, y recien
                        al mandar la petición se traduce a las FK reales.
                      </FieldDescription>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="wizard-resp-proyecto">Responsable de proyecto</FieldLabel>
                          <NativeSelect
                            id="wizard-resp-proyecto"
                            value={campos.responsableProyectoId}
                            onChange={(e) => setCampo("responsableProyectoId", e.target.value)}
                          >
                            <option value="">
                              {responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}
                            </option>
                            {responsablesQuery.data?.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombreLargo}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="wizard-resp-desarrollo">Responsable de desarrollo</FieldLabel>
                          <NativeSelect
                            id="wizard-resp-desarrollo"
                            value={campos.responsableDesarrolloId}
                            onChange={(e) => setCampo("responsableDesarrolloId", e.target.value)}
                          >
                            <option value="">
                              {responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}
                            </option>
                            {responsablesQuery.data?.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombreLargo}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="wizard-resp-implantacion">
                            Responsable de implantación
                          </FieldLabel>
                          <NativeSelect
                            id="wizard-resp-implantacion"
                            value={campos.responsableImplantacionId}
                            onChange={(e) => setCampo("responsableImplantacionId", e.target.value)}
                          >
                            <option value="">
                              {responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}
                            </option>
                            {responsablesQuery.data?.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombreLargo}
                              </option>
                            ))}
                          </NativeSelect>
                        </Field>
                      </div>
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
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-estado">Estado</FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-estado"
                                  value={campos.estadoId}
                                  onChange={(e) => setCampo("estadoId", e.target.value)}
                                >
                                  {estadosQuery.data?.map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.estado}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-sistema">Sistema</FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-sistema"
                                  value={campos.sistemaId}
                                  onChange={(e) => setCampo("sistemaId", e.target.value)}
                                >
                                  {sistemasQuery.data?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.nombre}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-ambiente">Ambiente</FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-ambiente"
                                  value={campos.ambienteId}
                                  onChange={(e) => setCampo("ambienteId", e.target.value)}
                                >
                                  {ambientesQuery.data?.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.nombre}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-resp-proyecto">
                                  Responsable de proyecto
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-proyecto"
                                  value={campos.responsableProyectoId}
                                  onChange={(e) => setCampo("responsableProyectoId", e.target.value)}
                                >
                                  {responsablesQuery.data?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.nombreLargo}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-resp-desarrollo">
                                  Responsable de desarrollo
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-desarrollo"
                                  value={campos.responsableDesarrolloId}
                                  onChange={(e) => setCampo("responsableDesarrolloId", e.target.value)}
                                >
                                  {responsablesQuery.data?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.nombreLargo}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-resp-implantacion">
                                  Responsable de implantación
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-implantacion"
                                  value={campos.responsableImplantacionId}
                                  onChange={(e) =>
                                    setCampo("responsableImplantacionId", e.target.value)
                                  }
                                >
                                  {responsablesQuery.data?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.nombreLargo}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                            </div>

                            <Field>
                              <FieldLabel htmlFor="wizard-edit-proyecto">Proyecto</FieldLabel>
                              <Input
                                id="wizard-edit-proyecto"
                                value={campos.proyecto}
                                onChange={(e) => setCampo("proyecto", e.target.value)}
                                required
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="wizard-edit-version">Versión</FieldLabel>
                              <Input
                                id="wizard-edit-version"
                                value={campos.version}
                                onChange={(e) => setCampo("version", e.target.value)}
                                required
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="wizard-edit-fecha-planteada">
                                Fecha planteada
                              </FieldLabel>
                              <Input
                                id="wizard-edit-fecha-planteada"
                                type="datetime-local"
                                value={campos.fechaPlanteada}
                                onChange={(e) => setCampo("fechaPlanteada", e.target.value)}
                                required
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="wizard-edit-fecha-real">
                                Fecha real (opcional)
                              </FieldLabel>
                              <Input
                                id="wizard-edit-fecha-real"
                                type="datetime-local"
                                value={campos.fechaReal}
                                onChange={(e) => setCampo("fechaReal", e.target.value)}
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="wizard-edit-descripcion">Descripción</FieldLabel>
                              <Textarea
                                id="wizard-edit-descripcion"
                                value={campos.descripcion}
                                onChange={(e) => setCampo("descripcion", e.target.value)}
                                placeholder="Opcional…"
                              />
                            </Field>

                            <Button
                              onClick={guardarCambios}
                              disabled={
                                !huboCambios || !formularioCompleto || actualizarImplantacionMutation.isPending
                              }
                              className="w-fit"
                            >
                              Guardar cambios
                            </Button>
                            {!huboCambios && (
                              <p className="text-xs text-muted-foreground">
                                No se detectó ningún cambio todavía -- modificá algún campo para
                                poder guardar.
                              </p>
                            )}
                            {actualizarImplantacionMutation.isError && (
                              <Alert variant="destructive">
                                <TriangleAlertIcon />
                                <AlertTitle>No se pudo guardar el cambio</AlertTitle>
                                <AlertDescription>
                                  {(actualizarImplantacionMutation.error as Error).message}
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
                      <Field>
                        <FieldLabel htmlFor="wizard-proyecto">Proyecto</FieldLabel>
                        <Input
                          id="wizard-proyecto"
                          value={campos.proyecto}
                          onChange={(e) => setCampo("proyecto", e.target.value)}
                          placeholder="Ej. Migración de facturación"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="wizard-version">Versión</FieldLabel>
                        <Input
                          id="wizard-version"
                          value={campos.version}
                          onChange={(e) => setCampo("version", e.target.value)}
                          placeholder="Ej. 1.0.0"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="wizard-fecha-planteada">Fecha planteada</FieldLabel>
                        <Input
                          id="wizard-fecha-planteada"
                          type="datetime-local"
                          value={campos.fechaPlanteada}
                          onChange={(e) => setCampo("fechaPlanteada", e.target.value)}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="wizard-fecha-real">Fecha real (opcional)</FieldLabel>
                        <Input
                          id="wizard-fecha-real"
                          type="datetime-local"
                          value={campos.fechaReal}
                          onChange={(e) => setCampo("fechaReal", e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="wizard-descripcion">Descripción</FieldLabel>
                        <Textarea
                          id="wizard-descripcion"
                          value={campos.descripcion}
                          onChange={(e) => setCampo("descripcion", e.target.value)}
                          placeholder="Opcional…"
                        />
                      </Field>
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
                    {actualizarImplantacionMutation.data ? (
                      <>
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>Solicitud #{solicitudIdActual} actualizada</AlertTitle>
                        </Alert>
                        {renderDetalle(actualizarImplantacionMutation.data)}
                        <Button onClick={actualizarOtra} className="w-fit">
                          Actualizar otra solicitud
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Todavía no guardaste ningún cambio.
                      </p>
                    )}
                  </div>
                )}
              </CarouselItem>

              {/* --- Paso 4 (solo "crear") --- */}
              <CarouselItem>
                {accion === "crear" && (
                  <div className="space-y-4">
                    {crearImplantacionMutation.isSuccess ? (
                      <>
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>
                            Solicitud #{crearImplantacionMutation.data.id} creada
                          </AlertTitle>
                        </Alert>
                        {renderDetalle(crearImplantacionMutation.data)}
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
                        <Button
                          onClick={() => crearImplantacionMutation.mutate(camposADto(campos))}
                          disabled={!formularioCompleto || crearImplantacionMutation.isPending}
                          className="w-fit"
                        >
                          Finalizar y crear
                        </Button>
                        {crearImplantacionMutation.isError && (
                          <Alert variant="destructive">
                            <TriangleAlertIcon />
                            <AlertTitle>No se pudo crear la solicitud</AlertTitle>
                            <AlertDescription>
                              {(crearImplantacionMutation.error as Error).message}
                            </AlertDescription>
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
    </div>
  )
}

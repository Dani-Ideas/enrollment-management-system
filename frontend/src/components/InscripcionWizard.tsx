import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  actualizarFormacionComplementaria,
  actualizarInscripcion,
  CATALOGOS_INSCRIPCION_QUERY,
  crearFormacionComplementaria,
  crearInscripcion,
  eliminarFormacionComplementaria,
  fetchFormacionesComplementariasPorInscripcion,
  fetchInscripcion,
  fetchInscripciones,
} from "@/api/client"
import type { InscripcionDTO, InscripcionRequestDTO } from "@/api/types"
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
  ChevronDownIcon,
  ChevronUpIcon,
  ListIcon,
  ListPlusIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"

type Accion = "lista" | "crear" | "actualizar"

// "Formaciones complementarias": lista 1:N ligada a una Inscripcion por FK (inscripcionId) -- ver
// FormacionComplementaria.java / FormacionComplementariaController.java. Mismo patron que
// FormularioPagoPage.tsx (no se comparte el tipo entre los dos archivos a proposito, ver
// el comentario de este componente mas abajo: son dos presentaciones separadas del mismo
// dominio). Al CREAR, se juntan como simples strings (todavia no hay inscripcionId) y se
// mandan uno por uno DESPUES de que la Inscripcion ya existe. Al ACTUALIZAR, cada fila ya
// tiene su id real (o null si se agrego durante la edicion).
interface FormacionComplementariaEditable {
  id: number | null
  descripcion: string
}

// Campos del formulario en su forma "de UI": todo como string (lo que dan los
// <input>/<select> nativos), incluidas las FK -- recien se convierten a
// numero/InscripcionRequestDTO en el momento de mandar la peticion (ver
// camposADto mas abajo). Se comparte una sola forma entre "crear" y
// "actualizar" porque son, ni mas ni menos, los mismos 11 campos del mismo
// InscripcionRequestDTO -- no hay motivo para dos tipos distintos.
interface CamposFormulario {
  estadoId: string
  sistemaId: string
  jefeCarreraId: string
  maestroId: string
  carreraId: string
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
  jefeCarreraId: "",
  maestroId: "",
  carreraId: "",
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

function renderDetalle(inscripcion: InscripcionDTO) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      <dt className="text-muted-foreground">Proyecto</dt>
      <dd>{inscripcion.proyecto}</dd>
      <dt className="text-muted-foreground">Versión</dt>
      <dd>{inscripcion.version}</dd>
      <dt className="text-muted-foreground">Estado</dt>
      <dd>{inscripcion.estado}</dd>
      <dt className="text-muted-foreground">Sistema</dt>
      <dd>{inscripcion.sistema}</dd>
      <dt className="text-muted-foreground">Ambiente</dt>
      <dd>{inscripcion.ambiente}</dd>
      <dt className="text-muted-foreground">Jefe de Carrera</dt>
      <dd>{inscripcion.jefeCarrera}</dd>
      <dt className="text-muted-foreground">Maestro</dt>
      <dd>{inscripcion.maestro}</dd>
      <dt className="text-muted-foreground">Carrera</dt>
      <dd>{inscripcion.carrera}</dd>
      <dt className="text-muted-foreground">Fecha planteada</dt>
      <dd>{inscripcion.fechaInscripcionPlanteada}</dd>
      {inscripcion.fechaInscripcionReal && (
        <>
          <dt className="text-muted-foreground">Fecha real</dt>
          <dd>{inscripcion.fechaInscripcionReal}</dd>
        </>
      )}
      {inscripcion.descripcion && (
        <>
          <dt className="text-muted-foreground">Descripción</dt>
          <dd>{inscripcion.descripcion}</dd>
        </>
      )}
    </dl>
  )
}

// ============================================================================
// Wizard en carrusel para el dominio "solicitud/inscripcion", exclusivo de
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
export function InscripcionWizard() {
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

  function camposADto(c: CamposFormulario): InscripcionRequestDTO {
    return {
      estadoId: Number(c.estadoId),
      sistemaId: Number(c.sistemaId),
      jefeCarreraId: Number(c.jefeCarreraId),
      maestroId: Number(c.maestroId),
      carreraId: Number(c.carreraId),
      ambienteId: Number(c.ambienteId),
      proyecto: c.proyecto,
      version: c.version,
      descripcion: c.descripcion.trim() === "" ? null : c.descripcion,
      fechaInscripcionPlanteada: c.fechaPlanteada,
      fechaInscripcionReal: c.fechaReal.trim() === "" ? null : c.fechaReal,
    }
  }

  // Validez por sub-paso (se reutiliza tal cual entre "crear", donde cada
  // grupo es un CarouselItem propio, y "actualizar", donde los tres grupos
  // conviven en un unico paso "Editar campos").
  const catalogoCompleto = campos.estadoId !== "" && campos.sistemaId !== "" && campos.ambienteId !== ""
  const responsablesCompletos =
    campos.jefeCarreraId !== "" &&
    campos.maestroId !== "" &&
    campos.carreraId !== ""
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
    setFiltroEstadoId("")
    setFiltroSistemaId("")
    setFiltroAmbienteId("")
    setDetalleAbiertoId(null)
    buscarInscripcionMutation.reset()
    crearInscripcionMutation.reset()
    actualizarInscripcionMutation.reset()
    setFormacionesNuevas([])
    crearFormacionesMutation.reset()
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    sincronizarFormacionesMutation.reset()
  }

  function elegirAccion(nueva: Accion) {
    setAccion(nueva)
    desbloquearHasta(1)
    api?.scrollTo(1)
  }

  // --- Catalogos para los <select> -- solo se piden si hacen falta (crear o
  // actualizar), nunca en "lista" (ahi no hay ningun formulario que llenar).
  // "Tablas genericas": los 4 catalogos en UNA sola llamada (via axios), en vez de 4
  // useQuery independientes -- mismo staleTime largo de antes (dato estatico).
  // "lista" se agrego aqui porque los 3 <select> de filtro (Estado/Sistema/Ambiente, en
  // la rama "lista" mas abajo) tambien necesitan los catalogos -- sin esto, catalogosQuery
  // nunca se disparaba al entrar a "Ver lista" y los filtros se quedaban sin opciones
  // (solo se veia "Todos").
  const catalogosHabilitados = accion === "crear" || accion === "actualizar" || accion === "lista"
  // ...CATALOGOS_INSCRIPCION_QUERY (mismo queryKey/queryFn/staleTime que usa
  // HomePage.tsx para precargar esto) -- asi comparten la MISMA entrada de cache de
  // TanStack Query, nunca dos objetos con el mismo contenido escritos a mano en 2 lugares.
  const catalogosQuery = useQuery({
    ...CATALOGOS_INSCRIPCION_QUERY,
    enabled: catalogosHabilitados,
  })
  // Shims con la MISMA forma que antes tenian los 4 useQuery sueltos (.data/.isLoading/
  // .isSuccess) -- el resto del archivo sigue leyendo estadosQuery.data,
  // sistemasQuery.isLoading, etc. sin tener que tocar cada uso.
  const estadosQuery = {
    data: catalogosQuery.data?.estados,
    isLoading: catalogosQuery.isLoading,
    isSuccess: catalogosQuery.isSuccess,
  }
  const sistemasQuery = {
    data: catalogosQuery.data?.sistemas,
    isLoading: catalogosQuery.isLoading,
    isSuccess: catalogosQuery.isSuccess,
  }
  const responsablesQuery = {
    data: catalogosQuery.data?.responsables,
    isLoading: catalogosQuery.isLoading,
    isSuccess: catalogosQuery.isSuccess,
  }
  const ambientesQuery = {
    data: catalogosQuery.data?.ambientes,
    isLoading: catalogosQuery.isLoading,
    isSuccess: catalogosQuery.isSuccess,
  }
  const catalogosListos = catalogosQuery.isSuccess

  // --- Filtros de la rama "lista" -- "" significa "sin filtrar por este campo" (mismo
  // criterio que el <select> de Categoría en otras pantallas: la opcion vacia de arriba
  // es la de "todos"). Se apoyan en ServiceArtifax del backend (la "mini base de datos" en
  // memoria) via fetchInscripciones(filtros) -- ver client.ts.
  const [filtroEstadoId, setFiltroEstadoId] = useState("")
  const [filtroSistemaId, setFiltroSistemaId] = useState("")
  const [filtroAmbienteId, setFiltroAmbienteId] = useState("")

  // --- "Ver detalle" en la rama "lista" -- por fila, colapsado por default. Al abrir una
  // fila se piden sus formaciones complementarias (no vienen embebidos en InscripcionDTO); al cerrarla, o
  // abrir otra, la query de la anterior queda cacheada por TanStack Query (no se vuelve a
  // pedir si se reabre dentro del staleTime default).
  const [detalleAbiertoId, setDetalleAbiertoId] = useState<number | null>(null)
  function alternarDetalle(id: number) {
    setDetalleAbiertoId((actual) => (actual === id ? null : id))
  }
  const detalleFormacionesQuery = useQuery({
    queryKey: ["formaciones-complementarias", detalleAbiertoId],
    queryFn: () => fetchFormacionesComplementariasPorInscripcion(detalleAbiertoId!),
    enabled: detalleAbiertoId !== null,
  })

  // --- Lista completa -- usada por "lista" (mostrar todo, con los 3 filtros de arriba) y
  // por "actualizar" (elegir de que solicitud partir, sin filtros). staleTime corto (10s):
  // a diferencia de los catalogos de arriba, esta es la lista de las SOLICITUDES mismas,
  // que es justo lo que este componente crea/edita. Los filtros van en el queryKey para
  // que TanStack Query trate cada combinacion como una consulta distinta (cachea cada una
  // por separado, y vuelve a pedir sola en cuanto cambia algun filtro).
  const inscripcionesQuery = useQuery({
    // Los filtros solo entran al queryKey (y a la peticion real) cuando accion === "lista"
    // -- "actualizar" comparte esta misma query pero para elegir de que solicitud partir,
    // nunca debe salir filtrada aunque hayan quedado filtros de una visita anterior a
    // "lista" (ademas, empezarDeNuevo() los resetea al volver al inicio).
    queryKey:
      accion === "lista"
        ? ["inscripciones", filtroEstadoId, filtroSistemaId, filtroAmbienteId]
        : ["inscripciones"],
    queryFn: () =>
      fetchInscripciones(
        accion === "lista"
          ? {
              estadoId: filtroEstadoId === "" ? undefined : Number(filtroEstadoId),
              sistemaId: filtroSistemaId === "" ? undefined : Number(filtroSistemaId),
              ambienteId: filtroAmbienteId === "" ? undefined : Number(filtroAmbienteId),
            }
          : undefined,
      ),
    enabled: accion === "lista" || accion === "actualizar",
    staleTime: 10 * 1000,
  })

  // --- Formaciones complementarias nuevas (paso "crear") -- simples strings todavia, la Inscripcion no
  // existe hasta que se confirma "Finalizar y crear" mas abajo.
  const [formacionesNuevas, setFormacionesNuevas] = useState<string[]>([])

  function agregarFormacionNueva() {
    setFormacionesNuevas((anteriores) => [...anteriores, ""])
  }

  function cambiarFormacionNueva(indice: number, valor: string) {
    setFormacionesNuevas((anteriores) => anteriores.map((d, i) => (i === indice ? valor : d)))
  }

  function quitarFormacionNueva(indice: number) {
    setFormacionesNuevas((anteriores) => anteriores.filter((_, i) => i !== indice))
  }

  // Se dispara SOLO despues de que crearInscripcionMutation ya confirmo la Inscripcion
  // (ver su onSuccess, abajo) -- recien ahi existe el id real que necesita cada formación complementaria
  // como FK. Un solo POST por formación complementaria (no hay bulk-create en el backend).
  const crearFormacionesMutation = useMutation({
    mutationFn: (args: { inscripcionId: number; descripciones: string[] }) =>
      Promise.all(
        args.descripciones.map((descripcion) =>
          crearFormacionComplementaria({ inscripcionId: args.inscripcionId, descripcion }),
        ),
      ),
  })

  // --- Crear: POST /inscripciones, y encadenado, un POST /formaciones-complementarias por cada
  // formación complementaria cargada en formacionesNuevas ---
  const crearInscripcionMutation = useMutation({
    mutationFn: crearInscripcion,
    onSuccess: (creada) => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      const descripciones = formacionesNuevas.map((d) => d.trim()).filter((d) => d !== "")
      if (descripciones.length > 0) {
        crearFormacionesMutation.mutate({ inscripcionId: creada.id, descripciones })
      }
      desbloquearHasta(4)
      api?.scrollTo(4)
    },
  })

  function crearOtra() {
    setCampos(CAMPOS_VACIOS)
    crearInscripcionMutation.reset()
    setFormacionesNuevas([])
    crearFormacionesMutation.reset()
    maxStepRef.current = 1
    setMaxStep(1)
    api?.scrollTo(1)
  }

  // --- Actualizar: elegir la solicitud, despues editarla ---
  const [listaIdInput, setListaIdInput] = useState("")
  const [solicitudIdActual, setSolicitudIdActual] = useState<number | null>(null)
  const [baseline, setBaseline] = useState<CamposFormulario | null>(null)
  const baselineIdRef = useRef<number | null>(null)

  const buscarInscripcionMutation = useMutation({ mutationFn: fetchInscripcion })

  // Formaciones complementarias de la solicitud elegida -- se piden aparte (no vienen embebidos en
  // InscripcionDTO), justo cuando se elige una solicitud para editar.
  const formacionesQuery = useQuery({
    queryKey: ["formaciones-complementarias", solicitudIdActual],
    queryFn: () => fetchFormacionesComplementariasPorInscripcion(solicitudIdActual!),
    enabled: accion === "actualizar" && solicitudIdActual !== null,
  })

  // Lista editable (agregar/quitar/editar) -- arranca como copia de formacionesQuery.data
  // (ver el useEffect de "baseline" mas abajo, que la siembra una sola vez por
  // solicitud). id null = fila agregada durante esta edicion, todavia sin crear.
  const [formacionesEditables, setFormacionesEditables] = useState<FormacionComplementariaEditable[]>([])
  // Snapshot de como estaban las formaciones complementarias ANTES de editar -- se compara contra
  // formacionesEditables para saber que crear/actualizar/borrar al guardar.
  const formacionesOriginalRef = useRef<FormacionComplementariaEditable[]>([])

  function agregarFormacionComplementariaEditable() {
    setFormacionesEditables((anteriores) => [...anteriores, { id: null, descripcion: "" }])
  }

  function cambiarFormacionComplementariaEditable(indice: number, valor: string) {
    setFormacionesEditables((anteriores) =>
      anteriores.map((el, i) => (i === indice ? { ...el, descripcion: valor } : el)),
    )
  }

  function quitarFormacionComplementariaEditable(indice: number) {
    setFormacionesEditables((anteriores) => anteriores.filter((_, i) => i !== indice))
  }

  function elegirSolicitud(id: number) {
    setSolicitudIdActual(id)
    buscarInscripcionMutation.mutate(id)
  }

  function buscarPorIdInput() {
    const id = Number(listaIdInput)
    if (!Number.isInteger(id) || id <= 0) return
    elegirSolicitud(id)
  }

  // Una vez que llega la solicitud elegida, sus formaciones complementarias, Y los 4 catalogos ya estan
  // cargados, se arma el "baseline": los mismos 11 campos pero resueltos a
  // partir del DTO (que trae texto, no ids -- InscripcionDTO esta aplanado
  // a proposito, ver InscripcionMapper.java) -- y de paso se siembra la lista editable
  // de formaciones complementarias. Resolver el id a partir del nombre asume nombres unicos por catalogo
  // (cierto con los datos sembrados); es la contrapartida de mostrarle al usuario un
  // <select> con nombres legibles en vez de pedirle que "llene una FK a mano".
  // baselineIdRef evita recalcular/rebotar al paso 2 de nuevo si el efecto
  // se re-ejecuta por otro motivo (p.ej. los catalogos terminan de cargar
  // despues que la solicitud) para la MISMA solicitud ya inicializada.
  useEffect(() => {
    if (accion !== "actualizar") return
    if (!buscarInscripcionMutation.isSuccess || !catalogosListos || !formacionesQuery.isSuccess) return
    if (baselineIdRef.current === solicitudIdActual) return
    baselineIdRef.current = solicitudIdActual

    const dto = buscarInscripcionMutation.data
    const nuevoBaseline: CamposFormulario = {
      estadoId: String(estadosQuery.data!.find((e) => e.estado === dto.estado)?.id ?? ""),
      sistemaId: String(sistemasQuery.data!.find((s) => s.nombre === dto.sistema)?.id ?? ""),
      jefeCarreraId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.jefeCarrera)?.id ?? "",
      ),
      maestroId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.maestro)?.id ?? "",
      ),
      carreraId: String(
        responsablesQuery.data!.find((r) => r.nombreLargo === dto.carrera)?.id ?? "",
      ),
      ambienteId: String(ambientesQuery.data!.find((a) => a.nombre === dto.ambiente)?.id ?? ""),
      proyecto: dto.proyecto,
      version: dto.version,
      descripcion: dto.descripcion ?? "",
      fechaPlanteada: aInputDatetime(dto.fechaInscripcionPlanteada),
      fechaReal: aInputDatetime(dto.fechaInscripcionReal),
    }
    const formacionesIniciales = formacionesQuery.data.map((el) => ({ id: el.id, descripcion: el.descripcion }))
    formacionesOriginalRef.current = formacionesIniciales
    setFormacionesEditables(formacionesIniciales)
    setBaseline(nuevoBaseline)
    setCampos(nuevoBaseline)
    desbloquearHasta(2)
    api?.scrollTo(2)
    // Deliberadamente no se listan estadosQuery.data/etc. como dependencias
    // (ya se leen adentro via catalogosListos, que si es dependencia) -- son
    // objetos nuevos en cada refetch aunque el contenido no cambie, listarlos
    // dispararia el efecto de mas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accion,
    buscarInscripcionMutation.isSuccess,
    buscarInscripcionMutation.data,
    catalogosListos,
    formacionesQuery.isSuccess,
    formacionesQuery.data,
    solicitudIdActual,
  ])

  // El boton de guardar SOLO se habilita si hay un cambio real -- en los campos
  // principales, en las formaciones complementarias, o en ambos (JSON.stringify alcanza para los campos: es
  // un objeto plano de 11 strings, siempre en el mismo orden de claves).
  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)
  const huboCambiosFormaciones =
    JSON.stringify(formacionesEditables) !== JSON.stringify(formacionesOriginalRef.current)
  const hayAlgoQueGuardar = huboCambios || huboCambiosFormaciones

  const actualizarInscripcionMutation = useMutation({
    mutationFn: (dto: InscripcionRequestDTO) => actualizarInscripcion(solicitudIdActual!, dto),
  })

  // Sincroniza la lista de formaciones complementarias contra lo que se tenia antes: crea los que se
  // agregaron (id null), actualiza los que cambiaron de texto, borra los que ya no estan
  // en formacionesEditables. Un solo POST/PUT/DELETE por formación complementaria (no hay bulk en el
  // backend) -- se disparan todos en paralelo con Promise.all.
  const sincronizarFormacionesMutation = useMutation({
    mutationFn: async (inscripcionId: number) => {
      const originales = formacionesOriginalRef.current
      const aCrear = formacionesEditables.filter((el) => el.id === null && el.descripcion.trim() !== "")
      const aActualizar = formacionesEditables.filter((el): el is { id: number; descripcion: string } => {
        if (el.id === null) return false
        const original = originales.find((o) => o.id === el.id)
        return original !== undefined && original.descripcion !== el.descripcion
      })
      const aBorrar = originales
        .map((o) => o.id)
        .filter((id): id is number => id !== null && !formacionesEditables.some((el) => el.id === id))

      await Promise.all([
        ...aCrear.map((el) => crearFormacionComplementaria({ inscripcionId, descripcion: el.descripcion })),
        ...aActualizar.map((el) => actualizarFormacionComplementaria(el.id, { inscripcionId, descripcion: el.descripcion })),
        ...aBorrar.map((id) => eliminarFormacionComplementaria(id)),
      ])
    },
  })

  // Guarda lo que haya cambiado -- campos principales, formaciones complementarias, o ambos -- y recien
  // avanza al paso de confirmacion si TODO termino bien. Es una funcion async (no
  // encadenada por onSuccess como crearInscripcionMutation) porque aca puede hacer
  // falta 0, 1 o 2 peticiones segun que haya cambiado, y las dos deben terminar antes de
  // mostrar la confirmacion.
  const [guardadoConfirmado, setGuardadoConfirmado] = useState(false)

  async function guardarCambios() {
    if (!hayAlgoQueGuardar || !formularioCompleto || solicitudIdActual === null) return
    try {
      if (huboCambios) {
        await actualizarInscripcionMutation.mutateAsync(camposADto(campos))
      }
      if (huboCambiosFormaciones) {
        await sincronizarFormacionesMutation.mutateAsync(solicitudIdActual)
      }
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      queryClient.invalidateQueries({ queryKey: ["formaciones-complementarias", solicitudIdActual] })
      buscarInscripcionMutation.mutate(solicitudIdActual) // refresca el detalle para la confirmacion
      setGuardadoConfirmado(true)
      desbloquearHasta(3)
      api?.scrollTo(3)
    } catch {
      // el error ya queda disponible en actualizarInscripcionMutation.error /
      // sincronizarFormacionesMutation.error, segun cual haya fallado
    }
  }

  function actualizarOtra() {
    setSolicitudIdActual(null)
    setBaseline(null)
    baselineIdRef.current = null
    setCampos(CAMPOS_VACIOS)
    setListaIdInput("")
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    buscarInscripcionMutation.reset()
    actualizarInscripcionMutation.reset()
    sincronizarFormacionesMutation.reset()
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

                    {/* Los 3 filtros pegan directo contra ServiceArtifax en el backend
                        (la "mini base de datos" en memoria) -- cambiar cualquiera dispara
                        un refetch solo (van en el queryKey de inscripcionesQuery), no
                        filtran en el navegador sobre una lista ya traida completa. */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="filtro-estado">Estado</FieldLabel>
                        <NativeSelect
                          id="filtro-estado"
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
                        <FieldLabel htmlFor="filtro-sistema">Sistema</FieldLabel>
                        <NativeSelect
                          id="filtro-sistema"
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
                        <FieldLabel htmlFor="filtro-ambiente">Ambiente</FieldLabel>
                        <NativeSelect
                          id="filtro-ambiente"
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
                        <AlertDescription>
                          {(inscripcionesQuery.error as Error).message}
                        </AlertDescription>
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
                                {renderDetalle(inscripcion)}
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
                          disabled={buscarInscripcionMutation.isPending || listaIdInput.trim() === ""}
                        >
                          <SearchIcon />
                          Buscar
                        </Button>
                      </div>
                      <FieldDescription>
                        O elegí una directamente de la lista de abajo.
                      </FieldDescription>
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
                          <FieldLabel htmlFor="wizard-resp-proyecto">Jefe de Carrera</FieldLabel>
                          <NativeSelect
                            id="wizard-resp-proyecto"
                            value={campos.jefeCarreraId}
                            onChange={(e) => setCampo("jefeCarreraId", e.target.value)}
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
                          <FieldLabel htmlFor="wizard-resp-desarrollo">Maestro</FieldLabel>
                          <NativeSelect
                            id="wizard-resp-desarrollo"
                            value={campos.maestroId}
                            onChange={(e) => setCampo("maestroId", e.target.value)}
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
                          <FieldLabel htmlFor="wizard-resp-inscripcion">
                            Carrera
                          </FieldLabel>
                          <NativeSelect
                            id="wizard-resp-inscripcion"
                            value={campos.carreraId}
                            onChange={(e) => setCampo("carreraId", e.target.value)}
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
                                  Jefe de Carrera
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-proyecto"
                                  value={campos.jefeCarreraId}
                                  onChange={(e) => setCampo("jefeCarreraId", e.target.value)}
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
                                  Maestro
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-desarrollo"
                                  value={campos.maestroId}
                                  onChange={(e) => setCampo("maestroId", e.target.value)}
                                >
                                  {responsablesQuery.data?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.nombreLargo}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="wizard-edit-resp-inscripcion">
                                  Carrera
                                </FieldLabel>
                                <NativeSelect
                                  id="wizard-edit-resp-inscripcion"
                                  value={campos.carreraId}
                                  onChange={(e) =>
                                    setCampo("carreraId", e.target.value)
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

                            {/* Formaciones complementarias ligadas a esta Inscripcion por FK -- se pueden
                                agregar, quitar y editar libremente aca; el diff contra
                                formacionesOriginalRef se resuelve recien al guardar. */}
                            <Field>
                              <FieldLabel>Formaciones complementarias</FieldLabel>
                              <FieldDescription>
                                Lista 1:N ligada a esta solicitud -- podés agregar filas
                                nuevas, borrar las que ya no hagan falta, o editar el texto
                                de las existentes.
                              </FieldDescription>
                              {formacionesQuery.isLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Spinner /> Cargando formaciones complementarias…
                                </div>
                              )}
                              <div className="space-y-2">
                                {formacionesEditables.map((formacion, indice) => (
                                  <div key={indice} className="flex gap-2">
                                    <Input
                                      value={formacion.descripcion}
                                      onChange={(e) => cambiarFormacionComplementariaEditable(indice, e.target.value)}
                                      placeholder="Descripción de la formación complementaria"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => quitarFormacionComplementariaEditable(indice)}
                                      aria-label="Quitar formación complementaria"
                                    >
                                      <Trash2Icon />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={agregarFormacionComplementariaEditable}
                                className="w-fit"
                              >
                                <ListPlusIcon />
                                Agregar formación complementaria
                              </Button>
                            </Field>

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
                    {/* guardadoConfirmado (no actualizarInscripcionMutation.data): un
                        guardado puede ser SOLO de formaciones complementarias, sin tocar los campos
                        principales -- en ese caso actualizarInscripcionMutation nunca
                        se dispara, pero igual hubo un guardado real que confirmar. */}
                    {guardadoConfirmado && buscarInscripcionMutation.data ? (
                      <>
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>Solicitud #{solicitudIdActual} actualizada</AlertTitle>
                        </Alert>
                        {renderDetalle(buscarInscripcionMutation.data)}
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
                    {crearInscripcionMutation.isSuccess ? (
                      <>
                        <Alert>
                          <CheckCircle2Icon />
                          <AlertTitle>
                            Solicitud #{crearInscripcionMutation.data.id} creada
                          </AlertTitle>
                        </Alert>
                        {renderDetalle(crearInscripcionMutation.data)}

                        {/* Estado del segundo paso encadenado (POST /formaciones-complementarias por
                            cada fila de formacionesNuevas) -- se disparo solo en el
                            onSuccess de crearInscripcionMutation, arriba. */}
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
                            <AlertDescription>
                              {(crearFormacionesMutation.error as Error).message}
                            </AlertDescription>
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

                        {/* Formaciones complementarias ligadas por FK a la Inscripcion que se va a crear --
                            todavia son solo texto (no hay inscripcionId hasta que el
                            POST /inscripciones de abajo confirme). Se crean en cadena,
                            uno por uno, en el onSuccess de crearInscripcionMutation. */}
                        <Field>
                          <FieldLabel>Formaciones complementarias</FieldLabel>
                          <FieldDescription>
                            Opcional -- se crean automáticamente después de la solicitud,
                            ya con su id real como referencia.
                          </FieldDescription>
                          <div className="space-y-2">
                            {formacionesNuevas.map((descripcion, indice) => (
                              <div key={indice} className="flex gap-2">
                                <Input
                                  value={descripcion}
                                  onChange={(e) => cambiarFormacionNueva(indice, e.target.value)}
                                  placeholder="Descripción de la formación complementaria"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => quitarFormacionNueva(indice)}
                                  aria-label="Quitar formación complementaria"
                                >
                                  <Trash2Icon />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={agregarFormacionNueva}
                            className="w-fit"
                          >
                            <ListPlusIcon />
                            Agregar formación complementaria
                          </Button>
                        </Field>

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
                            <AlertDescription>
                              {(crearInscripcionMutation.error as Error).message}
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

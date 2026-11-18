import { useEffect, useRef, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  actualizarCadenaDiplomas,
  actualizarInscripcion,
  CATALOGOS_INSCRIPCION_QUERY,
  crearCadenaDiplomas,
  crearInscripcion,
  fetchDiplomaPrimaria,
  fetchInscripcion,
  fetchInscripciones,
  fetchInscripcionSecundaria,
  fetchInscripcionUniversidad,
} from "@/api/client"
import type {
  CadenaDiplomasRequestDTO,
  DiplomaPrimariaDatosDTO,
  DiplomaSecundariaRequestDTO,
  DiplomaUniversidadRequestDTO,
  FormacionComplementariaRequestDTO,
  InscripcionDTO,
  InscripcionRequestDTO,
  InscripcionSecundariaDatosDTO,
  InscripcionUniversidadDatosDTO,
} from "@/api/types"
import type { CarouselApi } from "@/components/ui/carousel"
import { toast } from "@/components/ui/toast"
import type { SeccionResumen } from "./ResumenCadena"
import {
  type Accion,
  type CamposFormulario,
  type FormacionComplementariaEditable,
  CAMPOS_VACIOS,
  aInputDatetime,
  FIRMAS_DIPLOMA_PRIMARIA,
  FIRMAS_DIPLOMA_SECUNDARIA,
  FIRMAS_DIPLOMA_UNIVERSIDAD,
} from "./types"

// Toda la logica NO visual de los wizards de Inscripcion (TanStack Form),
// compartida entre FormularioPagoPage.tanstack.tsx (sin rama "lista") e
// InscripcionWizard.tanstack.tsx (con rama "lista"): mecanica del carrusel,
// el formulario (via TanStack Form), los 4 catalogos, la lista de
// solicitudes, y el CRUD de formaciones complementarias en sus dos variantes (nuevas al
// crear, editables al actualizar). El componente que llama a este hook solo
// pone el JSX -- ningun useState/useMutation/useQuery vive ahi.
//
// La rama "lista" en si (filtros + "Ver detalle") NO vive aca: es exclusiva
// de InscripcionWizard y queda como estado local de ese componente, con su
// propio wrapping de empezarDeNuevo() para resetearla tambien.
export function useInscripcionForm() {
  const queryClient = useQueryClient()

  const [accion, setAccion] = useState<Accion | null>(null)

  // --- Mecanica del carrusel ---
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

  // --- Formulario, via TanStack Form -- "campos" es una lectura reactiva de
  // TODOS los valores (useStore), con la misma forma que antes tenia el
  // useState a mano -- el resto del hook lee/compara "campos" tal cual.
  const form = useForm({ defaultValues: CAMPOS_VACIOS })
  const campos = useStore(form.store, (state) => state.values)

  // Los nombres de campo de CamposFormulario (estadoId/sistemaId/...) son solo del lado
  // del front (bind de los <select>) -- InscripcionRequestDTO ya no usa el sufijo "Id"
  // (estado/sistema/..., espejo de InscripcionRequestDto.java), por eso el renombre aca.
  function camposADto(c: CamposFormulario): InscripcionRequestDTO {
    return {
      estado: Number(c.estadoId),
      sistema: Number(c.sistemaId),
      jefeCarrera: Number(c.jefeCarreraId),
      maestro: Number(c.maestroId),
      carrera: Number(c.carreraId),
      ambiente: Number(c.ambienteId),
      proyecto: c.proyecto,
      version: c.version,
      descripcion: c.descripcion.trim() === "" ? null : c.descripcion,
      fechaInscripcionPlanteada: c.fechaPlanteada,
      fechaInscripcionReal: c.fechaReal.trim() === "" ? null : c.fechaReal,
    }
  }

  const catalogoCompleto = campos.estadoId !== "" && campos.sistemaId !== "" && campos.ambienteId !== ""
  const responsablesCompletos =
    campos.jefeCarreraId !== "" && campos.maestroId !== "" && campos.carreraId !== ""
  const datosProyectoCompletos =
    campos.proyecto.trim() !== "" && campos.version.trim() !== "" && campos.fechaPlanteada !== ""
  const formularioCompleto = catalogoCompleto && responsablesCompletos && datosProyectoCompletos

  function elegirAccion(nueva: Accion) {
    setAccion(nueva)
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
  }

  // --- Catalogos ("tablas genericas") -- los 4 en UNA sola llamada (via
  // axios), compartiendo cache de TanStack Query con HomePage.tsx. "lista"
  // esta incluida en el gate aunque FormularioPagoPage nunca la dispare --
  // es una rama muerta inofensiva ahi, y necesaria en InscripcionWizard
  // (sus 3 filtros tambien dependen de estos catalogos).
  const catalogosHabilitados = accion === "crear" || accion === "actualizar" || accion === "lista"
  const catalogosQuery = useQuery({
    ...CATALOGOS_INSCRIPCION_QUERY,
    enabled: catalogosHabilitados,
  })
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

  // Resuelve "campos" (ids sueltos, lo que hay en el formulario TODAVIA sin mandar) a la
  // MISMA forma que InscripcionDTO (aplanado a texto) -- asi la vista previa de "crear"
  // (paso de revision, antes de que la Inscripcion exista de verdad) puede reusar
  // DetalleInscripcion en vez de duplicar su propio <dl>. "id: 0" es un relleno: Detalle
  // Inscripcion no lo muestra en ningun lado.
  function camposAVistaPrevia(c: CamposFormulario): InscripcionDTO {
    return {
      id: 0,
      diplomaPrimariaId: null,
      estado: estadosQuery.data?.find((e) => String(e.id) === c.estadoId)?.estado ?? "",
      sistema: sistemasQuery.data?.find((s) => String(s.id) === c.sistemaId)?.nombre ?? "",
      jefeCarrera: responsablesQuery.data?.find((r) => String(r.id) === c.jefeCarreraId)?.nombreLargo ?? "",
      maestro: responsablesQuery.data?.find((r) => String(r.id) === c.maestroId)?.nombreLargo ?? "",
      carrera: responsablesQuery.data?.find((r) => String(r.id) === c.carreraId)?.nombreLargo ?? "",
      ambiente: ambientesQuery.data?.find((a) => String(a.id) === c.ambienteId)?.nombre ?? "",
      proyecto: c.proyecto,
      version: c.version,
      descripcion: c.descripcion.trim() === "" ? null : c.descripcion,
      fechaInscripcionPlanteada: c.fechaPlanteada,
      fechaInscripcionReal: c.fechaReal.trim() === "" ? null : c.fechaReal,
    }
  }

  // --- Filtros de la rama "lista" y "Ver detalle" -- unico consumidor de este hook
  // ahora (FormularioInscripciones.tsx, borrado InscripcionWizard), asi que ya no hay
  // motivo para mantenerlos como estado local de la pagina: viven aca.
  const [filtroEstadoId, setFiltroEstadoId] = useState("")
  const [filtroSistemaId, setFiltroSistemaId] = useState("")
  const [filtroAmbienteId, setFiltroAmbienteId] = useState("")

  const [detalleAbiertoId, setDetalleAbiertoId] = useState<number | null>(null)
  function alternarDetalle(id: number) {
    setDetalleAbiertoId((actual) => (actual === id ? null : id))
  }

  // --- Lista completa -- usada por "lista" (con los 3 filtros de arriba) y por
  // "actualizar" (elegir de que solicitud partir, sin filtros). GET /inscripciones ya no
  // filtra del lado del backend -- se pide la lista completa UNA vez (mismo cache para
  // "lista" y "actualizar") y el filtrado por estado/sistema/ambiente se hace aca, via
  // "select", resolviendo cada id de filtro al texto legible contra los mismos catalogos
  // de arriba (InscripcionDTO sale aplanado a texto, no trae ids).
  function useInscripciones() {
    return useQuery({
      queryKey: ["inscripciones"],
      queryFn: fetchInscripciones,
      enabled: accion === "lista" || accion === "actualizar",
      staleTime: 10 * 1000,
      select: (data) => {
        if (accion !== "lista") return data
        const estadoNombre =
          filtroEstadoId === "" ? null : estadosQuery.data?.find((e) => String(e.id) === filtroEstadoId)?.estado
        const sistemaNombre =
          filtroSistemaId === "" ? null : sistemasQuery.data?.find((s) => String(s.id) === filtroSistemaId)?.nombre
        const ambienteNombre =
          filtroAmbienteId === "" ? null : ambientesQuery.data?.find((a) => String(a.id) === filtroAmbienteId)?.nombre
        return data.filter(
          (i) =>
            (estadoNombre === null || i.estado === estadoNombre) &&
            (sistemaNombre === null || i.sistema === sistemaNombre) &&
            (ambienteNombre === null || i.ambiente === ambienteNombre),
        )
      },
    })
  }

  // --- Formaciones complementarias nuevas (paso "crear") -- misma forma que las
  // editables de "actualizar" (id siempre null, la Inscripcion todavia no existe).
  const [formacionesNuevas, setFormacionesNuevas] = useState<FormacionComplementariaEditable[]>([])

  function agregarFormacionNueva() {
    setFormacionesNuevas((anteriores) => [...anteriores, { id: null, descripcion: "" }])
  }
  function cambiarFormacionNueva(indice: number, valor: string) {
    setFormacionesNuevas((anteriores) =>
      anteriores.map((el, i) => (i === indice ? { ...el, descripcion: valor } : el)),
    )
  }
  function quitarFormacionNueva(indice: number) {
    setFormacionesNuevas((anteriores) => anteriores.filter((_, i) => i !== indice))
  }

  // UNA sola peticion HTTP: crea la Inscripcion y sus formaciones complementarias juntas
  // (ver InscripcionConFormacionComplementariaRequestDTO) -- el backend resuelve el FK
  // internamente, nada de ids intermedios del lado del cliente.
  const crearInscripcionMutation = useMutation({
    mutationFn: crearInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      desbloquearHasta(1)
      api?.scrollTo(1)
    },
  })

  function crearInscripcionConFormaciones() {
    crearInscripcionMutation.mutate({
      inscripcion: camposADto(campos),
      formacionesComplementarias: formacionesNuevas.map((el) => ({
        id: null,
        descripcion: el.descripcion,
      })),
    })
  }

  function crearOtra() {
    form.reset()
    crearInscripcionMutation.reset()
    setFormacionesNuevas([])
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    resetearCadena()
  }

  // --- Actualizar: elegir la solicitud, despues editarla ---
  const [listaIdInput, setListaIdInput] = useState("")
  const [solicitudIdActual, setSolicitudIdActual] = useState<number | null>(null)
  const [baseline, setBaseline] = useState<CamposFormulario | null>(null)
  const baselineIdRef = useRef<number | null>(null)

  const buscarInscripcionMutation = useMutation({ mutationFn: fetchInscripcion })

  const [formacionesEditables, setFormacionesEditables] = useState<FormacionComplementariaEditable[]>([])
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

  // Una vez que llega la solicitud elegida y los 4 catalogos ya estan
  // cargados, se arma el "baseline": los mismos 11 campos pero resueltos a
  // partir del DTO (que trae texto, no ids).
  //
  // formacionesEditables arranca con las formaciones que ya existen (vienen embebidas en
  // el mismo GET /inscripciones/{id}): el PUT manda la lista COMPLETA que debe quedar, y si
  // arrancara vacia el backend las borraria.
  useEffect(() => {
    if (accion !== "actualizar") return
    if (!buscarInscripcionMutation.isSuccess || !catalogosListos) return
    if (baselineIdRef.current === solicitudIdActual) return
    baselineIdRef.current = solicitudIdActual

    const dto = buscarInscripcionMutation.data.inscripcion
    const nuevoBaseline: CamposFormulario = {
      estadoId: String(estadosQuery.data!.find((e) => e.estado === dto.estado)?.id ?? ""),
      sistemaId: String(sistemasQuery.data!.find((s) => s.nombre === dto.sistema)?.id ?? ""),
      jefeCarreraId: String(responsablesQuery.data!.find((r) => r.nombreLargo === dto.jefeCarrera)?.id ?? ""),
      maestroId: String(responsablesQuery.data!.find((r) => r.nombreLargo === dto.maestro)?.id ?? ""),
      carreraId: String(responsablesQuery.data!.find((r) => r.nombreLargo === dto.carrera)?.id ?? ""),
      ambienteId: String(ambientesQuery.data!.find((a) => a.nombre === dto.ambiente)?.id ?? ""),
      proyecto: dto.proyecto,
      version: dto.version,
      descripcion: dto.descripcion ?? "",
      fechaPlanteada: aInputDatetime(dto.fechaInscripcionPlanteada),
      fechaReal: aInputDatetime(dto.fechaInscripcionReal),
    }
    const formacionesExistentes = buscarInscripcionMutation.data.formacionesComplementarias.map((f) => ({
      id: f.id,
      descripcion: f.descripcion,
    }))
    formacionesOriginalRef.current = formacionesExistentes
    setFormacionesEditables(formacionesExistentes)
    setBaseline(nuevoBaseline)
    // keepDefaultValues: sin esto, useForm({defaultValues: CAMPOS_VACIOS}) (arriba) vuelve a
    // escribir CAMPOS_VACIOS por encima de esto en el render SIGUIENTE -- su propio efecto
    // interno (sin deps, corre en cada render) compara options.defaultValues contra lo que
    // reset() dejo puesto ahi y, al no coincidir, lo pisa de vuelta a vacio. keepDefaultValues
    // evita que reset() cambie options.defaultValues, asi la comparacion de ese efecto sigue
    // dando "igual" y no hay pisada.
    form.reset(nuevoBaseline, { keepDefaultValues: true })
    if (dto.diplomaPrimariaId !== null) void cargarCadenaExistente(dto.diplomaPrimariaId)
    desbloquearHasta(1)
    api?.scrollTo(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, buscarInscripcionMutation.isSuccess, buscarInscripcionMutation.data, catalogosListos, solicitudIdActual])

  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)
  const huboCambiosFormaciones =
    JSON.stringify(formacionesEditables) !== JSON.stringify(formacionesOriginalRef.current)
  const hayAlgoQueGuardar = huboCambios || huboCambiosFormaciones

  // UNA sola peticion HTTP tambien para editar: mismo shape compuesto que
  // crearInscripcionConFormaciones() -- formacionesComplementarias es la lista
  // COMPLETA que debe quedar, el backend sincroniza solo (borra lo que falte,
  // actualiza lo que tenga id, crea lo que no) -- ver InscripcionServiceImpl.
  // actualizar(). Ya no hace falta un mutation aparte para sincronizar
  // formaciones: va todo en la misma llamada.
  const actualizarInscripcionMutation = useMutation({
    mutationFn: (dto: InscripcionRequestDTO) => {
      const formacionesComplementarias: FormacionComplementariaRequestDTO[] = formacionesEditables.map((el) => ({
        id: el.id,
        descripcion: el.descripcion,
      }))
      return actualizarInscripcion(solicitudIdActual!, { inscripcion: dto, formacionesComplementarias })
    },
  })

  const [guardadoConfirmado, setGuardadoConfirmado] = useState(false)

  async function guardarCambios() {
    if (!hayAlgoQueGuardar || !formularioCompleto || solicitudIdActual === null) return
    try {
      const actualizada = await actualizarInscripcionMutation.mutateAsync(camposADto(campos))
      // "campos" y "formacionesEditables" son exactamente lo que se acaba de
      // guardar -- sin este reset, "baseline"/"formacionesOriginalRef" quedan
      // con el valor viejo para siempre (el useEffect de arriba no vuelve a
      // correr para esta misma solicitud), y hayAlgoQueGuardar seguiria dando
      // true aunque no haya nada nuevo.
      setBaseline(campos)
      const sincronizadas = actualizada.formacionesComplementarias.map((f) => ({ id: f.id, descripcion: f.descripcion }))
      formacionesOriginalRef.current = sincronizadas
      setFormacionesEditables(sincronizadas)
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      setGuardadoConfirmado(true)
      desbloquearHasta(2)
      api?.scrollTo(2)
    } catch {
      // el error ya queda disponible en actualizarInscripcionMutation.error
    }
  }

  function actualizarOtra() {
    setSolicitudIdActual(null)
    setBaseline(null)
    baselineIdRef.current = null
    form.reset()
    setListaIdInput("")
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    buscarInscripcionMutation.reset()
    actualizarInscripcionMutation.reset()
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    resetearCadena()
  }

  // Mantiene la accion (viene de la URL, ya no hay paso para elegirla) y vuelve al
  // primer paso de esa accion con todo limpio.
  function empezarDeNuevo() {
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    form.reset()
    setBaseline(null)
    setSolicitudIdActual(null)
    baselineIdRef.current = null
    setListaIdInput("")
    buscarInscripcionMutation.reset()
    crearInscripcionMutation.reset()
    actualizarInscripcionMutation.reset()
    setFormacionesNuevas([])
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    setFiltroEstadoId("")
    setFiltroSistemaId("")
    setFiltroAmbienteId("")
    setDetalleAbiertoId(null)
    resetearCadena()
  }

  // --- Cadena Primaria/Secundaria/Universidad: estado del checklist de firmas y de los
  // formularios de Inscripcion Secundaria/Universidad -- el envio por HTTP de todo esto
  // (crear/actualizar) todavia no existe, solo el estado local y el resumen de abajo. ---

  // DiplomaPrimaria/DiplomaSecundaria/DiplomaUniversidad: checklist de firmas, sin TanStack
  // Form (no son campos de texto/select, son booleans sueltos -- ver CampoFirmas).
  const [diplomaPrimariaFirmas, setDiplomaPrimariaFirmas] = useState<Record<string, boolean>>({})
  function cambiarFirmaDiplomaPrimaria(campo: string, valor: boolean) {
    setDiplomaPrimariaFirmas((actual) => ({ ...actual, [campo]: valor }))
  }

  // InscripcionSecundaria/InscripcionUniversidad: mismos 11 campos que la Inscripcion de
  // Primaria (CamposFormulario) -- instancia de TanStack Form PROPIA para cada nivel, asi
  // CampoCatalogo/CampoResponsables/CampoDatosProyecto se reusan tal cual, sin modificarlos.
  const formInscripcionSecundaria = useForm({ defaultValues: CAMPOS_VACIOS })
  const camposInscripcionSecundaria = useStore(formInscripcionSecundaria.store, (state) => state.values)
  const catalogoSecundariaCompleto =
    camposInscripcionSecundaria.estadoId !== "" &&
    camposInscripcionSecundaria.sistemaId !== "" &&
    camposInscripcionSecundaria.ambienteId !== ""
  const responsablesSecundariaCompletos =
    camposInscripcionSecundaria.jefeCarreraId !== "" &&
    camposInscripcionSecundaria.maestroId !== "" &&
    camposInscripcionSecundaria.carreraId !== ""
  const datosProyectoSecundariaCompletos =
    camposInscripcionSecundaria.proyecto.trim() !== "" &&
    camposInscripcionSecundaria.version.trim() !== "" &&
    camposInscripcionSecundaria.fechaPlanteada !== ""
  const inscripcionSecundariaCompleta =
    catalogoSecundariaCompleto && responsablesSecundariaCompletos && datosProyectoSecundariaCompletos

  const [diplomaSecundariaFirmas, setDiplomaSecundariaFirmas] = useState<Record<string, boolean>>({})
  function cambiarFirmaDiplomaSecundaria(campo: string, valor: boolean) {
    setDiplomaSecundariaFirmas((actual) => ({ ...actual, [campo]: valor }))
  }

  const formInscripcionUniversidad = useForm({ defaultValues: CAMPOS_VACIOS })
  const camposInscripcionUniversidad = useStore(formInscripcionUniversidad.store, (state) => state.values)
  const catalogoUniversidadCompleto =
    camposInscripcionUniversidad.estadoId !== "" &&
    camposInscripcionUniversidad.sistemaId !== "" &&
    camposInscripcionUniversidad.ambienteId !== ""
  const responsablesUniversidadCompletos =
    camposInscripcionUniversidad.jefeCarreraId !== "" &&
    camposInscripcionUniversidad.maestroId !== "" &&
    camposInscripcionUniversidad.carreraId !== ""
  const datosProyectoUniversidadCompletos =
    camposInscripcionUniversidad.proyecto.trim() !== "" &&
    camposInscripcionUniversidad.version.trim() !== "" &&
    camposInscripcionUniversidad.fechaPlanteada !== ""
  const inscripcionUniversidadCompleta =
    catalogoUniversidadCompleto && responsablesUniversidadCompletos && datosProyectoUniversidadCompletos

  const [diplomaUniversidadFirmas, setDiplomaUniversidadFirmas] = useState<Record<string, boolean>>({})
  function cambiarFirmaDiplomaUniversidad(campo: string, valor: boolean) {
    setDiplomaUniversidadFirmas((actual) => ({ ...actual, [campo]: valor }))
  }

  // "Ya existia" por nivel -- solo se usa en "actualizar" (ver cargarCadenaExistente): un
  // nivel sin estos flags en true se manda en el PUT de la cadena SOLO si el usuario de
  // verdad completo algo ahi (ver construirCadenaDtoActualizar), para no crear filas vacias
  // nada mas porque el wizard paso por ese escalon.
  const [diplomaPrimariaYaExistia, setDiplomaPrimariaYaExistia] = useState(false)
  const [inscripcionSecundariaYaExistia, setInscripcionSecundariaYaExistia] = useState(false)
  const [diplomaSecundariaYaExistia, setDiplomaSecundariaYaExistia] = useState(false)
  const [inscripcionUniversidadYaExistia, setInscripcionUniversidadYaExistia] = useState(false)
  const [diplomaUniversidadYaExistia, setDiplomaUniversidadYaExistia] = useState(false)

  // Mismo renombre que camposADto (CamposFormulario -> *DatosDTO, sin sufijo "Id").
  function camposInscripcionADatos(c: CamposFormulario): InscripcionSecundariaDatosDTO | InscripcionUniversidadDatosDTO {
    return {
      estado: Number(c.estadoId),
      sistema: Number(c.sistemaId),
      jefeCarrera: Number(c.jefeCarreraId),
      maestro: Number(c.maestroId),
      carrera: Number(c.carreraId),
      ambiente: Number(c.ambienteId),
      proyecto: c.proyecto,
      version: c.version,
      descripcion: c.descripcion.trim() === "" ? null : c.descripcion,
      fechaInscripcionPlanteada: c.fechaPlanteada,
      fechaInscripcionReal: c.fechaReal.trim() === "" ? null : c.fechaReal,
    }
  }

  // Arma el CadenaDiplomasRequestDTO con TODO lo llenado hasta "hastaPaso" (inclusive) --
  // los niveles mas alla de ese paso quedan undefined (el back los trata como "no vino").
  function construirCadenaDto(hastaPaso: number): CadenaDiplomasRequestDTO {
    const dto: CadenaDiplomasRequestDTO = {}
    if (hastaPaso >= 2) {
      dto.diplomaPrimaria = {
        firmaMaestro1ro: diplomaPrimariaFirmas.firmaMaestro1ro ?? false,
        firmaMaestro2do: diplomaPrimariaFirmas.firmaMaestro2do ?? false,
        firmaMaestro3ro: diplomaPrimariaFirmas.firmaMaestro3ro ?? false,
        firmaMaestro4to: diplomaPrimariaFirmas.firmaMaestro4to ?? false,
        firmaMaestro5to: diplomaPrimariaFirmas.firmaMaestro5to ?? false,
        firmaMaestro6to: diplomaPrimariaFirmas.firmaMaestro6to ?? false,
        firmaDirectorPrimaria: diplomaPrimariaFirmas.firmaDirectorPrimaria ?? false,
      } satisfies DiplomaPrimariaDatosDTO
    }
    if (hastaPaso >= 4) {
      dto.inscripcionSecundaria = camposInscripcionADatos(camposInscripcionSecundaria) as InscripcionSecundariaDatosDTO
    }
    if (hastaPaso >= 6) {
      dto.diplomaSecundaria = {
        firmaMaestroPrimerGrado: diplomaSecundariaFirmas.firmaMaestroPrimerGrado ?? false,
        firmaMaestroSegundoGrado: diplomaSecundariaFirmas.firmaMaestroSegundoGrado ?? false,
        firmaMaestroTercerGrado: diplomaSecundariaFirmas.firmaMaestroTercerGrado ?? false,
        firmaOrientador: diplomaSecundariaFirmas.firmaOrientador ?? false,
        firmaDirectorSecundaria: diplomaSecundariaFirmas.firmaDirectorSecundaria ?? false,
      } satisfies DiplomaSecundariaRequestDTO
    }
    if (hastaPaso >= 8) {
      dto.inscripcionUniversidad = camposInscripcionADatos(camposInscripcionUniversidad) as InscripcionUniversidadDatosDTO
    }
    if (hastaPaso >= 10) {
      dto.diplomaUniversidad = {
        firmaDecanoFacultad: diplomaUniversidadFirmas.firmaDecanoFacultad ?? false,
        firmaCoordinadorCarrera: diplomaUniversidadFirmas.firmaCoordinadorCarrera ?? false,
        firmaSecretarioAcademico: diplomaUniversidadFirmas.firmaSecretarioAcademico ?? false,
        firmaRector: diplomaUniversidadFirmas.firmaRector ?? false,
      } satisfies DiplomaUniversidadRequestDTO
    }
    return dto
  }

  // onSuccess SIEMPRE salta al paso 11 (la ultima Confirmacion), sin importar desde que
  // Confirmacion se disparo "Finalizar y enviar" -- asi hay un UNICO lugar que muestra el
  // resultado final, en vez de duplicar esa vista en cada Confirmacion.
  const cadenaDiplomasMutation = useMutation({
    mutationFn: ({ inscripcionId, dto }: { inscripcionId: number; dto: CadenaDiplomasRequestDTO }) =>
      crearCadenaDiplomas(inscripcionId, dto),
    onSuccess: () => {
      desbloquearHasta(11)
      api?.scrollTo(11)
    },
  })

  // Dispara la UNICA peticion HTTP de la cadena, con todo lo llenado hasta "hastaPaso" --
  // llamado desde cualquier Confirmacion (pasos 3/5/7/9/11): el usuario puede "Finalizar y
  // enviar" apenas termina un nivel, sin obligacion de llegar al final.
  function enviarCadena(hastaPaso: number) {
    if (!crearInscripcionMutation.data) return
    cadenaDiplomasMutation.mutate({
      inscripcionId: crearInscripcionMutation.data.inscripcion.id,
      dto: construirCadenaDto(hastaPaso),
    })
  }

  // "Continuar": avanza al siguiente paso de la cadena sin mandar nada todavia -- a
  // diferencia de desbloquearHasta()+scrollTo() en crearInscripcionMutation.onSuccess (que
  // avanza porque el back YA confirmo algo), aca el avance es puramente local.
  function continuarCadena(siguientePaso: number) {
    desbloquearHasta(siguientePaso)
    api?.scrollTo(siguientePaso)
  }

  // Variante de construirCadenaDto() para "actualizar": no hay "hastaPaso" (los pasos 2-6
  // son navegacion local libre, sin Confirmacion intermedia -- el unico envio es el de la
  // Confirmacion final, paso 7), asi que la pregunta no es "hasta donde llego" sino "que
  // nivel tiene datos de verdad": un nivel entra si YA EXISTIA (se precargo con
  // cargarCadenaExistente) o si el usuario completo algo ahi recien ahora -- evita mandar
  // (y que el back cree) un nivel que el usuario solo de paso sin tocar.
  function construirCadenaDtoActualizar(): CadenaDiplomasRequestDTO {
    const dto: CadenaDiplomasRequestDTO = {}
    const primariaFirmada = Object.values(diplomaPrimariaFirmas).some(Boolean)
    const incluyePrimaria = diplomaPrimariaYaExistia || primariaFirmada
    if (incluyePrimaria) {
      dto.diplomaPrimaria = {
        firmaMaestro1ro: diplomaPrimariaFirmas.firmaMaestro1ro ?? false,
        firmaMaestro2do: diplomaPrimariaFirmas.firmaMaestro2do ?? false,
        firmaMaestro3ro: diplomaPrimariaFirmas.firmaMaestro3ro ?? false,
        firmaMaestro4to: diplomaPrimariaFirmas.firmaMaestro4to ?? false,
        firmaMaestro5to: diplomaPrimariaFirmas.firmaMaestro5to ?? false,
        firmaMaestro6to: diplomaPrimariaFirmas.firmaMaestro6to ?? false,
        firmaDirectorPrimaria: diplomaPrimariaFirmas.firmaDirectorPrimaria ?? false,
      } satisfies DiplomaPrimariaDatosDTO
    }

    const incluyeSecundaria = incluyePrimaria && (inscripcionSecundariaYaExistia || inscripcionSecundariaCompleta)
    if (incluyeSecundaria) {
      dto.inscripcionSecundaria = camposInscripcionADatos(camposInscripcionSecundaria) as InscripcionSecundariaDatosDTO
    }

    const secundariaFirmada = Object.values(diplomaSecundariaFirmas).some(Boolean)
    if (incluyeSecundaria && (diplomaSecundariaYaExistia || secundariaFirmada)) {
      dto.diplomaSecundaria = {
        firmaMaestroPrimerGrado: diplomaSecundariaFirmas.firmaMaestroPrimerGrado ?? false,
        firmaMaestroSegundoGrado: diplomaSecundariaFirmas.firmaMaestroSegundoGrado ?? false,
        firmaMaestroTercerGrado: diplomaSecundariaFirmas.firmaMaestroTercerGrado ?? false,
        firmaOrientador: diplomaSecundariaFirmas.firmaOrientador ?? false,
        firmaDirectorSecundaria: diplomaSecundariaFirmas.firmaDirectorSecundaria ?? false,
      } satisfies DiplomaSecundariaRequestDTO
    }

    const incluyeUniversidad =
      dto.diplomaSecundaria !== undefined && (inscripcionUniversidadYaExistia || inscripcionUniversidadCompleta)
    if (incluyeUniversidad) {
      dto.inscripcionUniversidad = camposInscripcionADatos(camposInscripcionUniversidad) as InscripcionUniversidadDatosDTO
    }

    const universidadFirmada = Object.values(diplomaUniversidadFirmas).some(Boolean)
    if (incluyeUniversidad && (diplomaUniversidadYaExistia || universidadFirmada)) {
      dto.diplomaUniversidad = {
        firmaDecanoFacultad: diplomaUniversidadFirmas.firmaDecanoFacultad ?? false,
        firmaCoordinadorCarrera: diplomaUniversidadFirmas.firmaCoordinadorCarrera ?? false,
        firmaSecretarioAcademico: diplomaUniversidadFirmas.firmaSecretarioAcademico ?? false,
        firmaRector: diplomaUniversidadFirmas.firmaRector ?? false,
      } satisfies DiplomaUniversidadRequestDTO
    }

    return dto
  }

  // UNICO envio de la cadena en "actualizar" -- PUT (upsert), disparado solo desde la
  // Confirmacion final (paso 7): a diferencia de "crear", no hay Confirmacion intermedia
  // que permita enviar parcial, asi que no hace falta "hastaPaso" aca.
  const actualizarCadenaMutation = useMutation({
    mutationFn: (inscripcionId: number) => actualizarCadenaDiplomas(inscripcionId, construirCadenaDtoActualizar()),
  })

  function guardarCadena() {
    if (solicitudIdActual === null) return
    actualizarCadenaMutation.mutate(solicitudIdActual)
  }

  // Precarga la cadena Secundaria/Universidad existente (si hay) apenas se arma el baseline
  // de "actualizar" -- "lineageId" es diplomaPrimariaId (ver InscripcionDTO), el mismo id
  // compartido por TODA la cadena. Los 3 niveles se intentan por SEPARADO (servicio propio
  // cada uno, GET /diplomas-primaria, /inscripciones-secundaria, /inscripciones-universidad)
  // e INDEPENDIENTES entre si -- que uno no tenga datos todavia no corta la precarga de los
  // demas (a diferencia de la validacion de secuencia del backend, que si es estricta). Cada
  // nivel sin datos muestra su propio toast informativo en vez de quedar en silencio.
  async function cargarCadenaExistente(lineageId: number) {
    function aCampos(i: {
      estado: string
      sistema: string
      jefeCarrera: string
      maestro: string
      carrera: string
      ambiente: string
      proyecto: string
      version: string
      descripcion: string | null
      fechaInscripcionPlanteada: string
      fechaInscripcionReal: string | null
    }): CamposFormulario {
      return {
        estadoId: String(estadosQuery.data!.find((e) => e.estado === i.estado)?.id ?? ""),
        sistemaId: String(sistemasQuery.data!.find((s) => s.nombre === i.sistema)?.id ?? ""),
        jefeCarreraId: String(responsablesQuery.data!.find((r) => r.nombreLargo === i.jefeCarrera)?.id ?? ""),
        maestroId: String(responsablesQuery.data!.find((r) => r.nombreLargo === i.maestro)?.id ?? ""),
        carreraId: String(responsablesQuery.data!.find((r) => r.nombreLargo === i.carrera)?.id ?? ""),
        ambienteId: String(ambientesQuery.data!.find((a) => a.nombre === i.ambiente)?.id ?? ""),
        proyecto: i.proyecto,
        version: i.version,
        descripcion: i.descripcion ?? "",
        fechaPlanteada: aInputDatetime(i.fechaInscripcionPlanteada),
        fechaReal: aInputDatetime(i.fechaInscripcionReal),
      }
    }

    try {
      const diploma = await fetchDiplomaPrimaria(lineageId)
      setDiplomaPrimariaFirmas({
        firmaMaestro1ro: diploma.firmaMaestro1ro,
        firmaMaestro2do: diploma.firmaMaestro2do,
        firmaMaestro3ro: diploma.firmaMaestro3ro,
        firmaMaestro4to: diploma.firmaMaestro4to,
        firmaMaestro5to: diploma.firmaMaestro5to,
        firmaMaestro6to: diploma.firmaMaestro6to,
        firmaDirectorPrimaria: diploma.firmaDirectorPrimaria,
      })
      setDiplomaPrimariaYaExistia(true)
    } catch {
      toast.add({
        type: "info",
        title: "Sin diploma de primaria",
        description: "Esta solicitud todavía no tiene diploma de primaria registrado en la base.",
      })
    }

    try {
      const { inscripcionSecundaria, diplomaSecundaria } = await fetchInscripcionSecundaria(lineageId)
      // keepDefaultValues: mismo motivo que en form.reset() de arriba (cargarBaseline).
      formInscripcionSecundaria.reset(aCampos(inscripcionSecundaria), { keepDefaultValues: true })
      setInscripcionSecundariaYaExistia(true)
      setDiplomaSecundariaFirmas({
        firmaMaestroPrimerGrado: diplomaSecundaria.firmaMaestroPrimerGrado,
        firmaMaestroSegundoGrado: diplomaSecundaria.firmaMaestroSegundoGrado,
        firmaMaestroTercerGrado: diplomaSecundaria.firmaMaestroTercerGrado,
        firmaOrientador: diplomaSecundaria.firmaOrientador,
        firmaDirectorSecundaria: diplomaSecundaria.firmaDirectorSecundaria,
      })
      setDiplomaSecundariaYaExistia(true)
    } catch {
      toast.add({
        type: "info",
        title: "Sin inscripción de secundaria",
        description: "Esta solicitud todavía no tiene inscripción de secundaria registrada en la base.",
      })
    }

    try {
      const { inscripcionUniversidad, diplomaUniversidad } = await fetchInscripcionUniversidad(lineageId)
      // keepDefaultValues: mismo motivo que en form.reset() de arriba (cargarBaseline).
      formInscripcionUniversidad.reset(aCampos(inscripcionUniversidad), { keepDefaultValues: true })
      setInscripcionUniversidadYaExistia(true)
      setDiplomaUniversidadFirmas({
        firmaDecanoFacultad: diplomaUniversidad.firmaDecanoFacultad,
        firmaCoordinadorCarrera: diplomaUniversidad.firmaCoordinadorCarrera,
        firmaSecretarioAcademico: diplomaUniversidad.firmaSecretarioAcademico,
        firmaRector: diplomaUniversidad.firmaRector,
      })
      setDiplomaUniversidadYaExistia(true)
    } catch {
      toast.add({
        type: "info",
        title: "Sin inscripción de universidad",
        description: "Esta solicitud todavía no tiene inscripción de universidad registrada en la base.",
      })
    }
  }

  function resetearCadena() {
    setDiplomaPrimariaFirmas({})
    setDiplomaSecundariaFirmas({})
    setDiplomaUniversidadFirmas({})
    formInscripcionSecundaria.reset()
    formInscripcionUniversidad.reset()
    cadenaDiplomasMutation.reset()
    setDiplomaPrimariaYaExistia(false)
    setInscripcionSecundariaYaExistia(false)
    setDiplomaSecundariaYaExistia(false)
    setInscripcionUniversidadYaExistia(false)
    setDiplomaUniversidadYaExistia(false)
    actualizarCadenaMutation.reset()
  }

  // Resumen de "todo lo llenado hasta ahora" en la cadena -- segun maxStep (el paso mas
  // lejano ya desbloqueado), no "current": si el usuario vuelve a un paso anterior, lo ya
  // llenado mas adelante sigue apareciendo aca. Vive aca (no en FormularioInscripciones.tsx)
  // porque el componente solo pone el JSX -- ningun calculo de estado derivado vive ahi.
  // ResumenCadena decide por si mismo si se renderiza (no en mobile); aca solo se junta el
  // contenido.
  const seccionesResumen: SeccionResumen[] = []
  if (accion === "crear") {
    if (crearInscripcionMutation.isSuccess) {
      const i = crearInscripcionMutation.data.inscripcion
      seccionesResumen.push({
        titulo: "Inscripción primaria",
        filas: [
          { etiqueta: "Proyecto", valor: i.proyecto },
          { etiqueta: "Versión", valor: i.version },
          { etiqueta: "Estado", valor: i.estado },
        ],
      })
    }
    if (maxStep >= 3) {
      seccionesResumen.push({
        titulo: "Diploma primaria",
        filas: FIRMAS_DIPLOMA_PRIMARIA.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaPrimariaFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
    if (maxStep >= 5) {
      seccionesResumen.push({
        titulo: "Inscripción secundaria",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionSecundaria.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionSecundaria.version },
        ],
      })
    }
    if (maxStep >= 7) {
      seccionesResumen.push({
        titulo: "Diploma secundaria",
        filas: FIRMAS_DIPLOMA_SECUNDARIA.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaSecundariaFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
    if (maxStep >= 9) {
      seccionesResumen.push({
        titulo: "Inscripción universidad",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionUniversidad.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionUniversidad.version },
        ],
      })
    }
    if (maxStep >= 11) {
      seccionesResumen.push({
        titulo: "Diploma universidad",
        filas: FIRMAS_DIPLOMA_UNIVERSIDAD.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaUniversidadFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
  }
  // "actualizar": mismos 6 niveles, pero via maxStep 2-6 (no hay Confirmacion intermedia que
  // los separe de a 2 pasos como en "crear" -- ver construirCadenaDtoActualizar).
  if (accion === "actualizar" && baseline !== null) {
    seccionesResumen.push({
      titulo: "Inscripción primaria",
      filas: [
        { etiqueta: "Proyecto", valor: baseline.proyecto },
        { etiqueta: "Versión", valor: baseline.version },
      ],
    })
    if (maxStep >= 2) {
      seccionesResumen.push({
        titulo: "Diploma primaria",
        filas: FIRMAS_DIPLOMA_PRIMARIA.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaPrimariaFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
    if (maxStep >= 3) {
      seccionesResumen.push({
        titulo: "Inscripción secundaria",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionSecundaria.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionSecundaria.version },
        ],
      })
    }
    if (maxStep >= 4) {
      seccionesResumen.push({
        titulo: "Diploma secundaria",
        filas: FIRMAS_DIPLOMA_SECUNDARIA.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaSecundariaFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
    if (maxStep >= 5) {
      seccionesResumen.push({
        titulo: "Inscripción universidad",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionUniversidad.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionUniversidad.version },
        ],
      })
    }
    if (maxStep >= 6) {
      seccionesResumen.push({
        titulo: "Diploma universidad",
        filas: FIRMAS_DIPLOMA_UNIVERSIDAD.map((item) => ({
          etiqueta: item.etiqueta,
          valor: diplomaUniversidadFirmas[item.campo] ? "Firmado" : "Pendiente",
        })),
      })
    }
  }

  return {
    accion,
    elegirAccion,
    empezarDeNuevo,

    api,
    setApi,
    current,
    maxStep,
    irAPaso,
    anterior,
    desbloquearHasta,

    form,
    campos,
    camposADto,
    camposAVistaPrevia,
    catalogoCompleto,
    responsablesCompletos,
    datosProyectoCompletos,
    formularioCompleto,

    estadosQuery,
    sistemasQuery,
    responsablesQuery,
    ambientesQuery,
    catalogosListos,

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

    huboCambios,
    huboCambiosFormaciones,
    hayAlgoQueGuardar,
    actualizarInscripcionMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
  }
}

export type InscripcionFormApi = ReturnType<typeof useInscripcionForm>

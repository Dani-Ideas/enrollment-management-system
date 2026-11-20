import { useEffect, useRef, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  actualizarChecklistItem,
  actualizarPruebaItem,
  actualizarSolicitud,
  CATALOGOS_INSCRIPCION_QUERY,
  crearChecklistItem,
  crearPruebaItem,
  crearSolicitud,
  fetchSolicitud,
  fetchSolicitudes,
  guardarAvisoVersiones,
  guardarDocumento,
} from "@/api/client"
import type {
  ChecklistItemRequestDTO,
  FormacionComplementariaRequestDTO,
  InscripcionDTO,
  PruebaRequestDTO,
  SolicitudConPanelesDTO,
  SolicitudRequestDTO,
  VoBoDTO,
} from "@/api/types"
import type { CarouselApi } from "@/components/ui/carousel"
import type { SeccionResumen } from "./ResumenCadena"
import {
  type Accion,
  type AvisoVersionEditable,
  type CamposFormulario,
  type ChecklistItemEditable,
  type DocumentoEditable,
  type FormacionComplementariaEditable,
  type PruebaItemEditable,
  AVISO_VERSION_VACIO,
  CAMPOS_VACIOS,
  CHECKLIST_ITEM_VACIO,
  DOCUMENTO_VACIO,
  PRUEBA_ITEM_VACIO,
  aInputDatetime,
} from "./types"

// Toda la logica NO visual de los wizards de Inscripcion (TanStack Form),
// compartida entre FormularioPagoPage.tanstack.tsx (sin rama "lista") e
// InscripcionWizard.tanstack.tsx (con rama "lista"): mecanica del carrusel,
// el formulario (via TanStack Form), los catalogos, la lista de
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
  // del front (bind de los <select>) -- SolicitudRequestDTO ya no usa el sufijo "Id"
  // (estado/sistema/..., espejo de SolNInscripcionRequestDto.java), por eso el renombre
  // aca. Usado por "crear" (cualquier nivel), la continuación de la cadena, y "actualizar"
  // (que ahora edita SOL_N_INSCRIPCION, no la tabla legacy -- ver mas abajo).
  function armarSolicitudRequestDto(
    c: CamposFormulario,
    etapa: number,
    solicitudAnterior: number | null,
  ): SolicitudRequestDTO {
    return {
      etapa,
      solicitudAnterior,
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

  // "ambienteInicial" viene del submenu de HomePage (ver router.tsx, search.ambiente) --
  // varias sucursales comparten el mismo catalogo CAT_AMBIENTE_INSCRIPCION, asi que elegir
  // "Crear"/"Actualizar" ya resuelve tambien en cual trabajar, sin que el formulario tenga
  // que volver a preguntarlo. "crear" lo precarga como valor del campo (sigue editable);
  // "actualizar" lo usa como filtro del selector compartido (ver useSolicitudes).
  function elegirAccion(nueva: Accion, ambienteInicial?: string) {
    setAccion(nueva)
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    if (ambienteInicial) {
      if (nueva === "crear") {
        form.setFieldValue("ambienteId", ambienteInicial)
      } else if (nueva === "actualizar") {
        setFiltroAmbienteId(ambienteInicial)
      }
    }
  }

  // --- Catalogos ("tablas genericas") -- en UNA sola llamada (via axios), compartiendo
  // cache de TanStack Query con HomePage.tsx. "lista" esta incluida en el gate aunque
  // FormularioPagoPage nunca la dispare -- es una rama muerta inofensiva ahi, y necesaria en
  // InscripcionWizard (sus 3 filtros tambien dependen de estos catalogos).
  const catalogosHabilitados =
    accion === "crear" || accion === "actualizar" || accion === "lista" || accion === "consultar"
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
  const tiposPruebaQuery = {
    data: catalogosQuery.data?.tiposPrueba,
    isLoading: catalogosQuery.isLoading,
    isSuccess: catalogosQuery.isSuccess,
  }
  const catalogosListos = catalogosQuery.isSuccess

  // Resuelve el id de CAT_ETAPA_INSCRIPCION por "orden" (1=Primaria, 2=Secundaria,
  // 3=Universidad) -- nunca un id fijo a mano: no hay seeder, el id real depende de en que
  // orden se insertaron las filas en cada base (ver CLAUDE.md).
  function idEtapa(orden: number): number {
    return catalogosQuery.data?.etapas.find((e) => e.orden === orden)?.id ?? 0
  }

  // Resuelve "campos" (ids sueltos, lo que hay en el formulario TODAVIA sin mandar) a la
  // MISMA forma que InscripcionDTO (aplanado a texto) -- asi la vista previa de "crear"
  // (paso de revision, antes de que la solicitud exista de verdad) puede reusar
  // DetalleInscripcion en vez de duplicar su propio <dl>. "id: 0" es un relleno: Detalle
  // Inscripcion no lo muestra en ningun lado.
  function camposAVistaPrevia(c: CamposFormulario): InscripcionDTO {
    return {
      id: 0,
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

  // --- Lista completa de SOL_N_INSCRIPCION -- usada por "lista" (con los 3 filtros de
  // arriba), "actualizar" (elegir cual editar) y "consultar" (elegir cual ver) -- las 3
  // acciones comparten el MISMO selector (CampoSelect + CampoVistaDetalle), solo cambia
  // que se hace despues de elegir una fila. "actualizar" tambien pasa por el filtro de
  // ambiente (nunca por estado/sistema, esos quedan en "" -- no hay controles para
  // tocarlos fuera de "lista"): llega preseteado desde el submenu de HomePage/elegirAccion,
  // para no mezclar sucursales en el selector.
  function useSolicitudes() {
    return useQuery({
      queryKey: ["solicitudes"],
      queryFn: fetchSolicitudes,
      enabled: accion === "lista" || accion === "actualizar" || accion === "consultar",
      staleTime: 10 * 1000,
      select: (data) => {
        if (accion !== "lista" && accion !== "actualizar") return data
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
  // editables de "actualizar" (id siempre null, la solicitud todavia no existe).
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

  // UNA sola peticion HTTP: crea la solicitud (etapa Primaria, sin anterior) y sus
  // formaciones complementarias juntas (ver SolicitudConFormacionesRequestDTO) -- el
  // backend resuelve el FK internamente, nada de ids intermedios del lado del cliente.
  const crearSolicitudMutation = useMutation({
    mutationFn: crearSolicitud,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
      // El bloqueo del stepper (maxStep) solo tiene sentido ANTES de que la Primaria
      // exista -- no hay nada que mostrar/editar en el resto de la cadena todavia. Una vez
      // creada, se desbloquea TODO el resto de un saque (ya no paso a paso via
      // continuarCadena/enviarCadena): el usuario navega libremente, el backend sigue
      // validando el orden real al "Finalizar y enviar" (409 si corresponde).
      desbloquearHasta(11)
      api?.scrollTo(1)
    },
  })

  function crearSolicitudConFormaciones() {
    crearSolicitudMutation.mutate({
      solicitud: armarSolicitudRequestDto(campos, idEtapa(1), null),
      formacionesComplementarias: formacionesNuevas.map((el) => ({
        id: null,
        descripcion: el.descripcion,
      })),
    })
  }

  function crearOtra() {
    form.reset()
    crearSolicitudMutation.reset()
    setFormacionesNuevas([])
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    resetearCadena()
  }

  // --- Selector compartido por "lista"/"actualizar"/"consultar" -- las 3 acciones eligen
  // una fila de la MISMA lista (useSolicitudes) con el MISMO CampoSelect/CampoVistaDetalle;
  // lo que cambia es que hace cada accion despues de elegir (ver los 2 useEffect mas abajo).
  const [listaIdInput, setListaIdInput] = useState("")
  const [solicitudIdActual, setSolicitudIdActual] = useState<number | null>(null)
  const [baseline, setBaseline] = useState<CamposFormulario | null>(null)
  const baselineIdRef = useRef<number | null>(null)
  // Etapa/solicitudAnterior de la solicitud elegida -- inmutables, pero
  // SolicitudRequestDTO los exige en cada PUT (ver armarSolicitudRequestDto/guardarCambios).
  const etapaIdActualRef = useRef<number | null>(null)
  const solicitudAnteriorIdActualRef = useRef<number | null>(null)

  const buscarSolicitudMutation = useMutation({ mutationFn: fetchSolicitud })

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
    buscarSolicitudMutation.mutate(id)
  }

  function buscarPorIdInput() {
    const id = Number(listaIdInput)
    if (!Number.isInteger(id) || id <= 0) return
    elegirSolicitud(id)
  }

  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)
  const huboCambiosFormaciones =
    JSON.stringify(formacionesEditables) !== JSON.stringify(formacionesOriginalRef.current)
  const hayAlgoQueGuardar = huboCambios || huboCambiosFormaciones

  // UNA sola peticion HTTP tambien para editar: mismo shape compuesto que
  // crearSolicitudConFormaciones() -- formacionesComplementarias es la lista
  // COMPLETA que debe quedar, el backend sincroniza solo (borra lo que falte,
  // actualiza lo que tenga id, crea lo que no) -- ver SolNInscripcionServiceImpl.
  // actualizar().
  const actualizarSolicitudMutation = useMutation({
    mutationFn: (dto: SolicitudRequestDTO) => {
      const formacionesComplementarias: FormacionComplementariaRequestDTO[] = formacionesEditables.map((el) => ({
        id: el.id,
        descripcion: el.descripcion,
      }))
      return actualizarSolicitud(solicitudIdActual!, { solicitud: dto, formacionesComplementarias })
    },
  })

  const [guardadoConfirmado, setGuardadoConfirmado] = useState(false)

  async function guardarCambios() {
    if (!hayAlgoQueGuardar || !formularioCompleto || solicitudIdActual === null) return
    try {
      const dto = armarSolicitudRequestDto(campos, etapaIdActualRef.current ?? 0, solicitudAnteriorIdActualRef.current)
      const actualizada = await actualizarSolicitudMutation.mutateAsync(dto)
      // "campos" y "formacionesEditables" son exactamente lo que se acaba de
      // guardar -- sin este reset, "baseline"/"formacionesOriginalRef" quedan
      // con el valor viejo para siempre (el useEffect de arriba no vuelve a
      // correr para esta misma solicitud), y hayAlgoQueGuardar seguiria dando
      // true aunque no haya nada nuevo.
      setBaseline(campos)
      const sincronizadas = actualizada.formacionesComplementarias.map((f) => ({ id: f.id, descripcion: f.descripcion }))
      formacionesOriginalRef.current = sincronizadas
      setFormacionesEditables(sincronizadas)
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
      setGuardadoConfirmado(true)
    } catch {
      // el error ya queda disponible en actualizarSolicitudMutation.error
    }
  }

  function actualizarOtra() {
    setSolicitudIdActual(null)
    setBaseline(null)
    baselineIdRef.current = null
    etapaIdActualRef.current = null
    solicitudAnteriorIdActualRef.current = null
    form.reset()
    setListaIdInput("")
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    setBaselineSecundaria(null)
    setBaselineUniversidad(null)
    buscarSolicitudMutation.reset()
    actualizarSolicitudMutation.reset()
    actualizarCargaMutation.reset()
    actualizarSecundariaMutation.reset()
    actualizarUniversidadMutation.reset()
    guardarPanelesPrimariaMutation.reset()
    guardarPanelesSecundariaMutation.reset()
    guardarPanelesUniversidadMutation.reset()
    setConsultaTieneSecundaria(false)
    setConsultaTieneUniversidad(false)
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
    etapaIdActualRef.current = null
    solicitudAnteriorIdActualRef.current = null
    setListaIdInput("")
    buscarSolicitudMutation.reset()
    crearSolicitudMutation.reset()
    actualizarSolicitudMutation.reset()
    actualizarCargaMutation.reset()
    actualizarSecundariaMutation.reset()
    actualizarUniversidadMutation.reset()
    guardarPanelesPrimariaMutation.reset()
    guardarPanelesSecundariaMutation.reset()
    guardarPanelesUniversidadMutation.reset()
    consultarMutation.reset()
    setFormacionesNuevas([])
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    setBaselineSecundaria(null)
    setBaselineUniversidad(null)
    setFiltroEstadoId("")
    setFiltroSistemaId("")
    setFiltroAmbienteId("")
    setDetalleAbiertoId(null)
    setConsultaTieneSecundaria(false)
    setConsultaTieneUniversidad(false)
    resetearCadena()
  }

  // --- Cadena Primaria/Secundaria/Universidad -- estados compartidos por "crear" (la
  // construye) y "actualizar"/"consultar" (recorren una que ya existe, ver
  // cargarActualizacion/cargarConsulta mas abajo). Reemplaza al viejo checklist fijo de
  // firmas booleanas por checklist/pruebas/documento/aviso de versiones dinamicos (ver
  // InscripcionChecklistEty/InscripcionPruebaEty/InscripcionDocumentoEty/
  // InscripcionAvisoVersionEty/InscripcionVoBoEty). ---

  function fabricarManejadorLista<T>(set: React.Dispatch<React.SetStateAction<T[]>>, vacio: T) {
    return {
      agregar: () => set((anteriores) => [...anteriores, vacio]),
      cambiar: (indice: number, campo: keyof T, valor: string) =>
        set((anteriores) => anteriores.map((el, i) => (i === indice ? { ...el, [campo]: valor } : el))),
      quitar: (indice: number) => set((anteriores) => anteriores.filter((_, i) => i !== indice)),
    }
  }

  // Primaria.
  const [checklistPrimaria, setChecklistPrimaria] = useState<ChecklistItemEditable[]>([])
  const checklistPrimariaAcciones = fabricarManejadorLista(setChecklistPrimaria, CHECKLIST_ITEM_VACIO)
  const [pruebasPrimaria, setPruebasPrimaria] = useState<PruebaItemEditable[]>([])
  const pruebasPrimariaAcciones = fabricarManejadorLista(setPruebasPrimaria, PRUEBA_ITEM_VACIO)
  const [documentoPrimaria, setDocumentoPrimaria] = useState<DocumentoEditable>(DOCUMENTO_VACIO)
  const [avisoPrimaria, setAvisoPrimaria] = useState<AvisoVersionEditable>(AVISO_VERSION_VACIO)
  const [voBoPrimaria, setVoBoPrimaria] = useState<VoBoDTO | null>(null)

  // Secundaria -- mismos 11 campos que Primaria (CamposFormulario), instancia de TanStack
  // Form PROPIA, asi CampoCatalogo/CampoResponsables/CampoDatosProyecto se reusan tal cual.
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
  const [solicitudSecundariaId, setSolicitudSecundariaId] = useState<number | null>(null)
  const [checklistSecundaria, setChecklistSecundaria] = useState<ChecklistItemEditable[]>([])
  const checklistSecundariaAcciones = fabricarManejadorLista(setChecklistSecundaria, CHECKLIST_ITEM_VACIO)
  const [pruebasSecundaria, setPruebasSecundaria] = useState<PruebaItemEditable[]>([])
  const pruebasSecundariaAcciones = fabricarManejadorLista(setPruebasSecundaria, PRUEBA_ITEM_VACIO)
  const [documentoSecundaria, setDocumentoSecundaria] = useState<DocumentoEditable>(DOCUMENTO_VACIO)
  const [avisoSecundaria, setAvisoSecundaria] = useState<AvisoVersionEditable>(AVISO_VERSION_VACIO)
  const [voBoSecundaria, setVoBoSecundaria] = useState<VoBoDTO | null>(null)

  // Universidad -- mismo patron, un nivel mas.
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
  const [solicitudUniversidadId, setSolicitudUniversidadId] = useState<number | null>(null)
  const [checklistUniversidad, setChecklistUniversidad] = useState<ChecklistItemEditable[]>([])
  const checklistUniversidadAcciones = fabricarManejadorLista(setChecklistUniversidad, CHECKLIST_ITEM_VACIO)
  const [pruebasUniversidad, setPruebasUniversidad] = useState<PruebaItemEditable[]>([])
  const pruebasUniversidadAcciones = fabricarManejadorLista(setPruebasUniversidad, PRUEBA_ITEM_VACIO)
  const [documentoUniversidad, setDocumentoUniversidad] = useState<DocumentoEditable>(DOCUMENTO_VACIO)
  const [avisoUniversidad, setAvisoUniversidad] = useState<AvisoVersionEditable>(AVISO_VERSION_VACIO)
  const [voBoUniversidad, setVoBoUniversidad] = useState<VoBoDTO | null>(null)

  // Guarda los paneles de UN nivel (checklist/pruebas/documento/aviso) contra una solicitud
  // que YA existe -- cada fila con id null se crea (POST), cada fila con id se actualiza
  // (PUT); filas sin seccion/tipoPrueba (vacias, nunca tocadas por el usuario) se saltean,
  // nunca se mandan al backend. Documento/aviso son 1:1: solo se manda si el usuario escribio
  // algo (si no, no hay nada que guardar y el backend los deja en null).
  async function guardarPanelesNivel(
    solicitudId: number,
    checklist: ChecklistItemEditable[],
    pruebas: PruebaItemEditable[],
    documento: DocumentoEditable,
    aviso: AvisoVersionEditable,
  ) {
    for (const item of checklist) {
      if (item.seccion.trim() === "" && item.actividad.trim() === "") continue
      const dto: ChecklistItemRequestDTO = {
        estado: Number(item.estadoId),
        responsable: Number(item.responsableId),
        seccion: item.seccion,
        actividad: item.actividad,
        descripcion: item.descripcion,
        conexion: item.conexion,
        comentario: item.comentario.trim() === "" ? null : item.comentario,
      }
      if (item.id === null) {
        await crearChecklistItem(solicitudId, dto)
      } else {
        await actualizarChecklistItem(solicitudId, item.id, dto)
      }
    }

    for (const item of pruebas) {
      if (item.tipoPruebaId === "" && item.ruta.trim() === "") continue
      const dto: PruebaRequestDTO = {
        tipoPrueba: Number(item.tipoPruebaId),
        estado: Number(item.estadoId),
        ruta: item.ruta,
        alcance: item.alcance,
        resultado: item.resultado,
        comentario: item.comentario,
      }
      if (item.id === null) {
        await crearPruebaItem(solicitudId, dto)
      } else {
        await actualizarPruebaItem(solicitudId, item.id, dto)
      }
    }

    if (documento.completo || documento.comentario.trim() !== "") {
      await guardarDocumento(solicitudId, documento)
    }
    if (aviso.reporte.trim() !== "") {
      await guardarAvisoVersiones(solicitudId, aviso)
    }
  }

  // Secuencia de peticiones HTTP que reemplaza al viejo POST /inscripciones/{id}/cadena-
  // diplomas (una sola peticion): ya no hay un endpoint combinado, asi que cada nivel (y
  // cada panel de ese nivel) es su propia llamada, en orden -- el backend sigue validando
  // la cadena (409 si el nivel anterior no tiene su VoBo completo), asi que un corte a
  // mitad de camino simplemente deja de avanzar, sin dejar nada corrupto (lo ya guardado
  // queda guardado). "hastaPaso" tiene el mismo significado que antes (ver etiquetaPaso).
  async function enviarSecuenciaCadena(hastaPaso: number) {
    const primariaId = crearSolicitudMutation.data?.solicitud.id
    if (primariaId === undefined) {
      throw new Error("Todavía no se creó la solicitud de primaria")
    }

    if (hastaPaso >= 2) {
      await guardarPanelesNivel(primariaId, checklistPrimaria, pruebasPrimaria, documentoPrimaria, avisoPrimaria)
      setVoBoPrimaria((await fetchSolicitud(primariaId)).voBo ?? null)
    }

    let secundariaId = solicitudSecundariaId
    if (hastaPaso >= 4 && secundariaId === null) {
      const creada = await crearSolicitud({
        solicitud: armarSolicitudRequestDto(camposInscripcionSecundaria, idEtapa(2), primariaId),
        formacionesComplementarias: [],
      })
      secundariaId = creada.solicitud.id
      setSolicitudSecundariaId(secundariaId)
    }

    if (hastaPaso >= 6 && secundariaId !== null) {
      await guardarPanelesNivel(secundariaId, checklistSecundaria, pruebasSecundaria, documentoSecundaria, avisoSecundaria)
      setVoBoSecundaria((await fetchSolicitud(secundariaId)).voBo ?? null)
    }

    let universidadId = solicitudUniversidadId
    if (hastaPaso >= 8 && secundariaId !== null && universidadId === null) {
      const creada = await crearSolicitud({
        solicitud: armarSolicitudRequestDto(camposInscripcionUniversidad, idEtapa(3), secundariaId),
        formacionesComplementarias: [],
      })
      universidadId = creada.solicitud.id
      setSolicitudUniversidadId(universidadId)
    }

    if (hastaPaso >= 10 && universidadId !== null) {
      await guardarPanelesNivel(
        universidadId,
        checklistUniversidad,
        pruebasUniversidad,
        documentoUniversidad,
        avisoUniversidad,
      )
      setVoBoUniversidad((await fetchSolicitud(universidadId)).voBo ?? null)
    }
  }

  // onSuccess SIEMPRE salta al paso 11 (la ultima Confirmacion), sin importar desde que
  // Confirmacion se disparo "Finalizar y enviar" -- asi hay un UNICO lugar que muestra el
  // resultado final, en vez de duplicar esa vista en cada Confirmacion.
  const cadenaMutation = useMutation({
    mutationFn: enviarSecuenciaCadena,
    onSuccess: () => {
      desbloquearHasta(11)
      api?.scrollTo(11)
    },
  })

  // Dispara la secuencia de la cadena, con todo lo llenado hasta "hastaPaso" -- llamado
  // desde cualquier Confirmacion (pasos 3/5/7/9/11): el usuario puede "Finalizar y enviar"
  // apenas termina un nivel, sin obligacion de llegar al final.
  function enviarCadena(hastaPaso: number) {
    cadenaMutation.mutate(hastaPaso)
  }

  // "Continuar": avanza al siguiente paso de la cadena sin mandar nada todavia -- a
  // diferencia de desbloquearHasta()+scrollTo() en crearSolicitudMutation.onSuccess (que
  // avanza porque el back YA confirmo algo), aca el avance es puramente local.
  function continuarCadena(siguientePaso: number) {
    desbloquearHasta(siguientePaso)
    api?.scrollTo(siguientePaso)
  }

  function resetearCadena() {
    setChecklistPrimaria([])
    setPruebasPrimaria([])
    setDocumentoPrimaria(DOCUMENTO_VACIO)
    setAvisoPrimaria(AVISO_VERSION_VACIO)
    setVoBoPrimaria(null)

    formInscripcionSecundaria.reset()
    setSolicitudSecundariaId(null)
    setChecklistSecundaria([])
    setPruebasSecundaria([])
    setDocumentoSecundaria(DOCUMENTO_VACIO)
    setAvisoSecundaria(AVISO_VERSION_VACIO)
    setVoBoSecundaria(null)

    formInscripcionUniversidad.reset()
    setSolicitudUniversidadId(null)
    setChecklistUniversidad([])
    setPruebasUniversidad([])
    setDocumentoUniversidad(DOCUMENTO_VACIO)
    setAvisoUniversidad(AVISO_VERSION_VACIO)
    setVoBoUniversidad(null)

    cadenaMutation.reset()
  }

  // --- Consultar (solo lectura): "igual que crear" pero recorriendo una cadena que YA
  // existe en SOL_N_INSCRIPCION, en vez de construirla. Usa el MISMO selector que
  // "lista"/"actualizar" (listaIdInput/elegirSolicitud/buscarSolicitudMutation, ver arriba)
  // -- la unica diferencia es que hace con la solicitud elegida (ver el useEffect mas
  // abajo). Reusa EXACTAMENTE los mismos estados de la cadena de "crear"
  // (form/formInscripcionSecundaria/formInscripcionUniversidad, checklist*/pruebas*/
  // documento*/aviso*/voBo*) -- nunca hay dos acciones activas al mismo tiempo, asi que no
  // hay conflicto; FormularioInscripciones.tsx los renderiza con disabled=true cuando
  // accion === "consultar". ---
  const [consultaTieneSecundaria, setConsultaTieneSecundaria] = useState(false)
  const [consultaTieneUniversidad, setConsultaTieneUniversidad] = useState(false)

  function aplicarNivelConsultado(
    dto: SolicitudConPanelesDTO,
    formNivel: typeof form,
    setChecklist: (items: ChecklistItemEditable[]) => void,
    setPruebas: (items: PruebaItemEditable[]) => void,
    setDocumento: (d: DocumentoEditable) => void,
    setAviso: (a: AvisoVersionEditable) => void,
    setVoBo: (v: VoBoDTO | null) => void,
    // Solo lo usa "actualizar" (ver cargarActualizacion mas abajo) -- "consultar" nunca lo
    // pasa, no tiene nocion de "baseline" porque todo es de solo lectura.
    setBaseline?: (c: CamposFormulario) => void,
  ) {
    const s = dto.solicitud
    const camposNivel: CamposFormulario = {
      estadoId: String(estadosQuery.data?.find((e) => e.estado === s.estado)?.id ?? ""),
      sistemaId: String(sistemasQuery.data?.find((x) => x.nombre === s.sistema)?.id ?? ""),
      jefeCarreraId: String(responsablesQuery.data?.find((r) => r.nombreLargo === s.jefeCarrera)?.id ?? ""),
      maestroId: String(responsablesQuery.data?.find((r) => r.nombreLargo === s.maestro)?.id ?? ""),
      carreraId: String(responsablesQuery.data?.find((r) => r.nombreLargo === s.carrera)?.id ?? ""),
      ambienteId: String(ambientesQuery.data?.find((a) => a.nombre === s.ambiente)?.id ?? ""),
      proyecto: s.proyecto,
      version: s.version,
      descripcion: s.descripcion ?? "",
      fechaPlanteada: aInputDatetime(s.fechaInscripcionPlanteada),
      fechaReal: aInputDatetime(s.fechaInscripcionReal),
    }
    formNivel.reset(camposNivel, { keepDefaultValues: true })

    setChecklist(
      dto.checklist.map((c) => ({
        id: c.id,
        estadoId: String(estadosQuery.data?.find((e) => e.estado === c.estado)?.id ?? ""),
        responsableId: String(responsablesQuery.data?.find((r) => r.nombreLargo === c.responsable)?.id ?? ""),
        seccion: c.seccion,
        actividad: c.actividad,
        descripcion: c.descripcion,
        conexion: c.conexion,
        comentario: c.comentario ?? "",
      })),
    )
    setPruebas(
      dto.pruebas.map((p) => ({
        id: p.id,
        tipoPruebaId: String(tiposPruebaQuery.data?.find((t) => t.nombre === p.tipoPrueba)?.id ?? ""),
        estadoId: String(estadosQuery.data?.find((e) => e.estado === p.estado)?.id ?? ""),
        ruta: p.ruta,
        alcance: p.alcance,
        resultado: p.resultado,
        comentario: p.comentario,
      })),
    )
    setDocumento(dto.documento ? { completo: dto.documento.completo, comentario: dto.documento.comentario } : DOCUMENTO_VACIO)
    setAviso(dto.avisoVersiones ? { reporte: dto.avisoVersiones.reporte } : AVISO_VERSION_VACIO)
    setVoBo(dto.voBo ?? null)
    setBaseline?.(camposNivel)
  }

  // Recibe la Primaria ya elegida por el selector compartido y, si existen, carga
  // Secundaria/Universidad encadenadas (via solicitudAnteriorId) -- no hay endpoint de
  // "hijos de X", asi que se resuelve filtrando la lista completa de /solicitudes.
  async function cargarConsulta(primaria: SolicitudConPanelesDTO) {
    if (primaria.solicitud.etapa !== "Primaria") {
      throw new Error(
        `La solicitud #${primaria.solicitud.id} es de etapa ${primaria.solicitud.etapa}, no Primaria -- elegí la solicitud de Primaria para consultar toda la cadena.`,
      )
    }
    aplicarNivelConsultado(primaria, form, setChecklistPrimaria, setPruebasPrimaria, setDocumentoPrimaria, setAvisoPrimaria, setVoBoPrimaria)

    const lista = await fetchSolicitudes()
    const secundariaResumen = lista.find((s) => s.solicitudAnteriorId === primaria.solicitud.id) ?? null
    setConsultaTieneSecundaria(secundariaResumen !== null)
    if (secundariaResumen === null) return

    const secundaria = await fetchSolicitud(secundariaResumen.id)
    aplicarNivelConsultado(
      secundaria,
      formInscripcionSecundaria,
      setChecklistSecundaria,
      setPruebasSecundaria,
      setDocumentoSecundaria,
      setAvisoSecundaria,
      setVoBoSecundaria,
    )

    const universidadResumen = lista.find((s) => s.solicitudAnteriorId === secundaria.solicitud.id) ?? null
    setConsultaTieneUniversidad(universidadResumen !== null)
    if (universidadResumen === null) return

    const universidad = await fetchSolicitud(universidadResumen.id)
    aplicarNivelConsultado(
      universidad,
      formInscripcionUniversidad,
      setChecklistUniversidad,
      setPruebasUniversidad,
      setDocumentoUniversidad,
      setAvisoUniversidad,
      setVoBoUniversidad,
    )
  }

  const consultarMutation = useMutation({
    mutationFn: cargarConsulta,
    onSuccess: () => {
      desbloquearHasta(12)
      api?.scrollTo(1)
    },
  })

  // "consultar": dispara la carga de la cadena apenas el selector compartido trae la
  // solicitud elegida -- mismo disparador que el baseline de "actualizar" (arriba), solo
  // que hace otra cosa con el resultado.
  useEffect(() => {
    if (accion !== "consultar") return
    if (!buscarSolicitudMutation.isSuccess || !catalogosListos) return
    if (baselineIdRef.current === solicitudIdActual) return
    baselineIdRef.current = solicitudIdActual
    setConsultaTieneSecundaria(false)
    setConsultaTieneUniversidad(false)
    consultarMutation.mutate(buscarSolicitudMutation.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, buscarSolicitudMutation.isSuccess, buscarSolicitudMutation.data, catalogosListos, solicitudIdActual])

  function consultarOtra() {
    setSolicitudIdActual(null)
    baselineIdRef.current = null
    setListaIdInput("")
    buscarSolicitudMutation.reset()
    consultarMutation.reset()
    setConsultaTieneSecundaria(false)
    setConsultaTieneUniversidad(false)
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    resetearCadena()
  }

  // --- Actualizar (editable): "igual que consultar" -- misma cadena completa, el mismo
  // selector compartido y los mismos estados por nivel -- pero cada nivel queda editable
  // (FormularioInscripciones.tsx los renderiza con disabled=false cuando accion ===
  // "actualizar") y cada paso tiene su propio "Guardar cambios" en vez de limitarse a
  // "Siguiente". A diferencia de "consultar", la fila elegida en el selector puede ser de
  // CUALQUIER etapa -- si no es la Primaria, se camina para atras (via
  // solicitudAnteriorId) hasta encontrarla, porque la cadena se edita siempre desde la
  // raiz. ---

  const [baselineSecundaria, setBaselineSecundaria] = useState<CamposFormulario | null>(null)
  const [baselineUniversidad, setBaselineUniversidad] = useState<CamposFormulario | null>(null)
  const huboCambiosSecundaria =
    baselineSecundaria !== null && JSON.stringify(camposInscripcionSecundaria) !== JSON.stringify(baselineSecundaria)
  const huboCambiosUniversidad =
    baselineUniversidad !== null &&
    JSON.stringify(camposInscripcionUniversidad) !== JSON.stringify(baselineUniversidad)

  async function cargarActualizacion(seleccionada: SolicitudConPanelesDTO) {
    let primaria = seleccionada
    while (primaria.solicitud.etapa !== "Primaria" && primaria.solicitud.solicitudAnteriorId !== null) {
      primaria = await fetchSolicitud(primaria.solicitud.solicitudAnteriorId)
    }

    setSolicitudIdActual(primaria.solicitud.id)
    etapaIdActualRef.current = idEtapa(1)
    solicitudAnteriorIdActualRef.current = null
    aplicarNivelConsultado(
      primaria,
      form,
      setChecklistPrimaria,
      setPruebasPrimaria,
      setDocumentoPrimaria,
      setAvisoPrimaria,
      setVoBoPrimaria,
      setBaseline,
    )
    const formacionesExistentes = primaria.formacionesComplementarias.map((f) => ({ id: f.id, descripcion: f.descripcion }))
    formacionesOriginalRef.current = formacionesExistentes
    setFormacionesEditables(formacionesExistentes)

    const lista = await fetchSolicitudes()
    const secundariaResumen = lista.find((s) => s.solicitudAnteriorId === primaria.solicitud.id) ?? null
    setConsultaTieneSecundaria(secundariaResumen !== null)
    if (secundariaResumen === null) return

    const secundaria = await fetchSolicitud(secundariaResumen.id)
    setSolicitudSecundariaId(secundaria.solicitud.id)
    aplicarNivelConsultado(
      secundaria,
      formInscripcionSecundaria,
      setChecklistSecundaria,
      setPruebasSecundaria,
      setDocumentoSecundaria,
      setAvisoSecundaria,
      setVoBoSecundaria,
      setBaselineSecundaria,
    )

    const universidadResumen = lista.find((s) => s.solicitudAnteriorId === secundaria.solicitud.id) ?? null
    setConsultaTieneUniversidad(universidadResumen !== null)
    if (universidadResumen === null) return

    const universidad = await fetchSolicitud(universidadResumen.id)
    setSolicitudUniversidadId(universidad.solicitud.id)
    aplicarNivelConsultado(
      universidad,
      formInscripcionUniversidad,
      setChecklistUniversidad,
      setPruebasUniversidad,
      setDocumentoUniversidad,
      setAvisoUniversidad,
      setVoBoUniversidad,
      setBaselineUniversidad,
    )
  }

  const actualizarCargaMutation = useMutation({
    mutationFn: cargarActualizacion,
    onSuccess: () => {
      desbloquearHasta(12)
      api?.scrollTo(1)
    },
  })

  // Dispara la carga de la cadena apenas el selector compartido trae la solicitud elegida
  // -- se guarda contra el id de la fila ELEGIDA (buscarSolicitudMutation.data), no contra
  // "solicitudIdActual": cargarActualizacion lo reasigna al id de la Primaria resuelta, que
  // puede ser distinto al elegido (si se elegio una secundaria/universidad), y comparar
  // contra ese mismo estado que la funcion reasigna reentraria en bucle.
  useEffect(() => {
    if (accion !== "actualizar") return
    if (!buscarSolicitudMutation.isSuccess || !catalogosListos) return
    const elegidaId = buscarSolicitudMutation.data.solicitud.id
    if (baselineIdRef.current === elegidaId) return
    baselineIdRef.current = elegidaId
    setConsultaTieneSecundaria(false)
    setConsultaTieneUniversidad(false)
    actualizarCargaMutation.mutate(buscarSolicitudMutation.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, buscarSolicitudMutation.isSuccess, buscarSolicitudMutation.data, catalogosListos])

  // PUT generico de un nivel YA existente, sin formaciones (a diferencia de la Primaria,
  // que si las tiene) -- una instancia por nivel para que isPending/isSuccess/isError no se
  // pisen entre si cuando el usuario navega de un paso a otro sin guardar.
  const actualizarSecundariaMutation = useMutation({
    mutationFn: (dto: SolicitudRequestDTO) => actualizarSolicitud(solicitudSecundariaId!, { solicitud: dto }),
  })
  const actualizarUniversidadMutation = useMutation({
    mutationFn: (dto: SolicitudRequestDTO) => actualizarSolicitud(solicitudUniversidadId!, { solicitud: dto }),
  })

  async function guardarCambiosSecundaria() {
    if (!huboCambiosSecundaria || solicitudSecundariaId === null || solicitudIdActual === null) return
    const dto = armarSolicitudRequestDto(camposInscripcionSecundaria, idEtapa(2), solicitudIdActual)
    try {
      await actualizarSecundariaMutation.mutateAsync(dto)
      setBaselineSecundaria(camposInscripcionSecundaria)
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
    } catch {
      // el error ya queda disponible en actualizarSecundariaMutation.error
    }
  }

  async function guardarCambiosUniversidad() {
    if (!huboCambiosUniversidad || solicitudUniversidadId === null || solicitudSecundariaId === null) return
    const dto = armarSolicitudRequestDto(camposInscripcionUniversidad, idEtapa(3), solicitudSecundariaId)
    try {
      await actualizarUniversidadMutation.mutateAsync(dto)
      setBaselineUniversidad(camposInscripcionUniversidad)
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
    } catch {
      // el error ya queda disponible en actualizarUniversidadMutation.error
    }
  }

  // Guarda checklist/pruebas/documento/aviso de un nivel que YA existe -- a diferencia de
  // guardarPanelesNivel() (llamado DESDE la cadena de "crear", nivel recien creado), aca
  // simplemente sincroniza contra un id fijo y refresca el VoBo. 3 instancias separadas,
  // mismo motivo que las de arriba.
  const guardarPanelesPrimariaMutation = useMutation({
    mutationFn: async () => {
      if (solicitudIdActual === null) return
      await guardarPanelesNivel(solicitudIdActual, checklistPrimaria, pruebasPrimaria, documentoPrimaria, avisoPrimaria)
      setVoBoPrimaria((await fetchSolicitud(solicitudIdActual)).voBo ?? null)
    },
  })
  const guardarPanelesSecundariaMutation = useMutation({
    mutationFn: async () => {
      if (solicitudSecundariaId === null) return
      await guardarPanelesNivel(
        solicitudSecundariaId,
        checklistSecundaria,
        pruebasSecundaria,
        documentoSecundaria,
        avisoSecundaria,
      )
      setVoBoSecundaria((await fetchSolicitud(solicitudSecundariaId)).voBo ?? null)
    },
  })
  const guardarPanelesUniversidadMutation = useMutation({
    mutationFn: async () => {
      if (solicitudUniversidadId === null) return
      await guardarPanelesNivel(
        solicitudUniversidadId,
        checklistUniversidad,
        pruebasUniversidad,
        documentoUniversidad,
        avisoUniversidad,
      )
      setVoBoUniversidad((await fetchSolicitud(solicitudUniversidadId)).voBo ?? null)
    },
  })

  // Resumen de "todo lo llenado hasta ahora" en la cadena -- cada seccion aparece cuando ese
  // nivel/panel REALMENTE tiene datos guardados (voBo/solicitudXId), no segun que paso este
  // desbloqueado: desde que crearSolicitudMutation desbloquea toda la cadena de un saque,
  // "maxStep" ya no sirve para esto (ver su onSuccess). Solo "crear" la tiene. ResumenCadena
  // decide por si mismo si se renderiza (no en mobile); aca solo se junta el contenido.
  const seccionesResumen: SeccionResumen[] = []
  if (accion === "crear") {
    if (crearSolicitudMutation.isSuccess) {
      const s = crearSolicitudMutation.data.solicitud
      seccionesResumen.push({
        titulo: "Inscripción primaria",
        filas: [
          { etiqueta: "Proyecto", valor: s.proyecto },
          { etiqueta: "Versión", valor: s.version },
          { etiqueta: "Estado", valor: s.estado },
        ],
      })
    }
    // Ya no se puede usar "maxStep >= X" para decidir que secciones mostrar -- desde que
    // crearSolicitudMutation desbloquea TODA la cadena de un saque (ver su onSuccess),
    // maxStep deja de significar "hasta donde se avanzo realmente". En su lugar, cada
    // seccion se gatilla por si ese nivel/panel REALMENTE tiene datos guardados.
    if (voBoPrimaria !== null) {
      seccionesResumen.push({
        titulo: "Checklist/pruebas/documentación (primaria)",
        filas: [
          { etiqueta: "Checklist", valor: voBoPrimaria.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoPrimaria.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoPrimaria.documentacion ? "Completo" : "Pendiente" },
        ],
      })
    }
    if (solicitudSecundariaId !== null) {
      seccionesResumen.push({
        titulo: "Inscripción secundaria",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionSecundaria.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionSecundaria.version },
        ],
      })
    }
    if (voBoSecundaria !== null) {
      seccionesResumen.push({
        titulo: "Checklist/pruebas/documentación (secundaria)",
        filas: [
          { etiqueta: "Checklist", valor: voBoSecundaria.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoSecundaria.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoSecundaria.documentacion ? "Completo" : "Pendiente" },
        ],
      })
    }
    if (solicitudUniversidadId !== null) {
      seccionesResumen.push({
        titulo: "Inscripción universidad",
        filas: [
          { etiqueta: "Proyecto", valor: camposInscripcionUniversidad.proyecto },
          { etiqueta: "Versión", valor: camposInscripcionUniversidad.version },
        ],
      })
    }
    if (voBoUniversidad !== null) {
      seccionesResumen.push({
        titulo: "Checklist/pruebas/documentación (universidad)",
        filas: [
          { etiqueta: "Checklist", valor: voBoUniversidad.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoUniversidad.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoUniversidad.documentacion ? "Completo" : "Pendiente" },
        ],
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
    catalogosListos,

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
    solicitudIdActual,
    baseline,

    formacionesEditables,
    agregarFormacionComplementariaEditable,
    cambiarFormacionComplementariaEditable,
    quitarFormacionComplementariaEditable,

    huboCambios,
    huboCambiosFormaciones,
    hayAlgoQueGuardar,
    actualizarSolicitudMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
    actualizarCargaMutation,

    baselineSecundaria,
    huboCambiosSecundaria,
    actualizarSecundariaMutation,
    guardarCambiosSecundaria,
    baselineUniversidad,
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
  }
}

export type InscripcionFormApi = ReturnType<typeof useInscripcionForm>

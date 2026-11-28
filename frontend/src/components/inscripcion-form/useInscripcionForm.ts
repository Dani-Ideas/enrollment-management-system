import { useEffect, useRef, useState } from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  actualizarChecklistItem,
  actualizarPruebaItem,
  actualizarSolicitud,
  CATALOGOS_INSCRIPCION_QUERY,
  crearChecklistItem,
  crearChecklistTemplate,
  crearPruebaItem,
  crearSolicitud,
  fetchSolicitud,
  fetchSolicitudes,
  guardarAvisoVersiones,
  guardarDocumento,
  PLANTILLAS_CHECKLIST_QUERY,
} from "@/api/client"
import type {
  ChecklistItemRequestDTO,
  FormacionComplementariaRequestDTO,
  InscripcionDTO,
  PruebaRequestDTO,
  SolicitudConPanelesDTO,
  SolicitudDTO,
  SolicitudRequestDTO,
  VoBoDTO,
} from "@/api/types"
import type { CarouselApi } from "@/components/ui/carousel"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { FilaResumen, SeccionResumen } from "./ResumenCadena"
import {
  type Accion,
  type AvisoVersionEditable,
  type PasoCadena,
  type CamposFormulario,
  type ChecklistItemEditable,
  type DocumentoEditable,
  type FormacionComplementariaEditable,
  type PlantillasChecklistApi,
  type PruebaItemEditable,
  AVISO_VERSION_VACIO,
  CAMPOS_VACIOS,
  CHECKLIST_ITEM_VACIO,
  CORTE_ESCRITORIO,
  DOCUMENTO_VACIO,
  pasosDe,
  plantillaDesdeChecklist,
  PRUEBA_ITEM_VACIO,
  aInputDatetime,
} from "./types"

export function useInscripcionForm({
  accion: accionUrl,
  ambiente: ambienteUrl,
}: { accion?: Accion; ambiente?: string } = {}) {
  const queryClient = useQueryClient()

  const [accion, setAccion] = useState<Accion | null>(null)

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

  // ◽ RESUMEN -- el panel colapsable/arrastrable que lo contiene.
  const esEscritorio = useMediaQuery(CORTE_ESCRITORIO)
  const resumenPanelRef = useRef<PanelImperativeHandle>(null)
  const [resumenColapsado, setResumenColapsado] = useState(false)

  function alternarResumen() {
    const panel = resumenPanelRef.current
    if (panel === null) return
    if (resumenColapsado) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }

  const form = useForm({ defaultValues: CAMPOS_VACIOS })
  const campos = useStore(form.store, (state) => state.values)

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

  useEffect(() => {
    if (accionUrl && accion === null) {
      elegirAccion(accionUrl, ambienteUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionUrl, ambienteUrl])

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

  // 📌 PASOS DINAMICOS -- NUCLEO EN EL HOOK: si el ambiente lleva paneles, la lista y los indices.
  // 📌 PASOS DINAMICOS: el ambiente que SI lleva los pasos de paneles.
  function idAmbientePrincipal(): string {
    const ambientes = ambientesQuery.data
    if (ambientes === undefined || ambientes.length === 0) return ""
    return String(ambientes.reduce((a, b) => (a.id <= b.id ? a : b)).id)
  }

  const llevaPaneles =
    !catalogosListos || campos.ambienteId === "" || campos.ambienteId === idAmbientePrincipal()

  const pasos = pasosDe(accion, llevaPaneles)
  const ultimoPaso = Math.max(pasos.length - 1, 0)

  // 📌 PASOS DINAMICOS
  function pasoDe(paso: PasoCadena): number {
    return pasos.indexOf(paso)
  }

  // 📌 PASOS DINAMICOS
  function trasPaso(paso: PasoCadena): number {
    const i = pasos.indexOf(paso)
    if (i === -1) return 0
    return Math.min(i + 1, ultimoPaso)
  }

  // 📌 PASOS DINAMICOS: sin esto, cambiar de ambiente deja el carrusel en un paso inexistente.
  useEffect(() => {
    if (maxStepRef.current > ultimoPaso) {
      maxStepRef.current = ultimoPaso
      setMaxStep(ultimoPaso)
    }
    if (currentRef.current > ultimoPaso) {
      api?.scrollTo(ultimoPaso)
    }
  }, [ultimoPaso, api])

  function idEtapa(orden: number): number {
    return catalogosQuery.data?.etapas.find((e) => e.orden === orden)?.id ?? 0
  }

  const ESTADO_POR_DEFECTO = "Pendiente"

  function idEstadoPorDefecto(): string {
    const fila = estadosQuery.data?.find(
      (e) => e.estado.trim().toLowerCase() === ESTADO_POR_DEFECTO.toLowerCase(),
    )
    return fila === undefined ? "" : String(fila.id)
  }

  function camposInicialesCrear(): CamposFormulario {
    return { ...CAMPOS_VACIOS, estadoId: idEstadoPorDefecto() }
  }

  function dtoACampos(s: SolicitudDTO): CamposFormulario {
    return {
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
  }

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

  const [filtroEstadoId, setFiltroEstadoId] = useState("")
  const [filtroSistemaId, setFiltroSistemaId] = useState("")
  const [filtroAmbienteId, setFiltroAmbienteId] = useState("")

  const [detalleAbiertoId, setDetalleAbiertoId] = useState<number | null>(null)
  function alternarDetalle(id: number) {
    setDetalleAbiertoId((actual) => (actual === id ? null : id))
  }

  function useSolicitudes() {
    return useQuery({
      queryKey: ["solicitudes"],
      queryFn: fetchSolicitudes,
      enabled:
        accion === "lista" || accion === "actualizar" || accion === "consultar" || (accion === "crear" && clonarAbierto),
      staleTime: 10 * 1000,
      select: (data) => {
        if (accion !== "lista" && accion !== "actualizar" && accion !== "crear") return data
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
            (ambienteNombre === null || i.ambiente === ambienteNombre) &&
            (accion !== "crear" || i.etapa === "Primaria"),
        )
      },
    })
  }

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

  // ⭐ HTTP 1 de 2 (crear): POST de la primaria. Su data.solicitud.id es lo unico que habilita el HTTP 2.
  const crearSolicitudMutation = useMutation({
    mutationFn: crearSolicitud,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
      desbloquearHasta(ultimoPaso)
      api?.scrollTo(pasoDe("confirmar-creacion"))
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
    form.reset(camposInicialesCrear())
    crearSolicitudMutation.reset()
    setFormacionesNuevas([])
    setClonarAbierto(false)
    clonarMutation.reset()
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
    resetearCadena()
  }

  // 🔳 CLONAR -- NUCLEO: GET de una solicitud existente + reset del form. No hay endpoint de clonado.
  const [clonarAbierto, setClonarAbierto] = useState(false)
  const clonarMutation = useMutation({
    mutationFn: fetchSolicitud,
    onSuccess: (dto) => {
      form.reset({ ...dtoACampos(dto.solicitud), fechaPlanteada: "", fechaReal: "" }, { keepDefaultValues: true })
      setClonarAbierto(false)
    },
  })

  // 🔳 CLONAR
  function clonarDesde(id: number) {
    clonarMutation.mutate(id)
  }

  const solicitudesQuery = useSolicitudes()

  const [listaIdInput, setListaIdInput] = useState("")
  const [solicitudIdActual, setSolicitudIdActual] = useState<number | null>(null)
  const [baseline, setBaseline] = useState<CamposFormulario | null>(null)
  const baselineIdRef = useRef<number | null>(null)
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

  // ⭐ HTTP 1 de 2 (actualizar): PUT de la primaria -- aca el id ya existe, no hay que esperarlo.
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
      setBaseline(campos)
      const sincronizadas = actualizada.formacionesComplementarias.map((f) => ({ id: f.id, descripcion: f.descripcion }))
      formacionesOriginalRef.current = sincronizadas
      setFormacionesEditables(sincronizadas)
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
      setGuardadoConfirmado(true)
    } catch {
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
    setClonarAbierto(false)
    clonarMutation.reset()
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


  function fabricarManejadorLista<T>(set: React.Dispatch<React.SetStateAction<T[]>>, vacio: T) {
    return {
      agregar: () => set((anteriores) => [...anteriores, vacio]),
      // Para aplicar una plantilla: agrega al final y NO borra lo que ya estaba escrito.
      agregarVarias: (nuevas: T[]) => set((anteriores) => [...anteriores, ...nuevas]),
      cambiar: (indice: number, campo: keyof T, valor: string) =>
        set((anteriores) => anteriores.map((el, i) => (i === indice ? { ...el, [campo]: valor } : el))),
      quitar: (indice: number) => set((anteriores) => anteriores.filter((_, i) => i !== indice)),
    }
  }

  // Plantillas de checklist: UNA sola query y UNA sola mutacion para los 3 niveles. No
  // hace falta una por nivel porque guardar() recibe las filas del nivel que lo llama, y
  // aplicar una plantilla es puro estado local (agregarVarias), sin HTTP.
  const plantillasChecklistQuery = useQuery(PLANTILLAS_CHECKLIST_QUERY)
  const guardarPlantillaChecklistMutation = useMutation({
    mutationFn: crearChecklistTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANTILLAS_CHECKLIST_QUERY.queryKey })
    },
  })

  const plantillasChecklist: PlantillasChecklistApi = {
    query: plantillasChecklistQuery,
    arquitecturas: catalogosQuery.data?.tiposArquitectura ?? [],
    guardando: guardarPlantillaChecklistMutation.isPending,
    error: guardarPlantillaChecklistMutation.isError
      ? (guardarPlantillaChecklistMutation.error as Error).message
      : null,
    guardada: guardarPlantillaChecklistMutation.isSuccess ? guardarPlantillaChecklistMutation.data.nombre : null,
    // "nivel" es el ORDEN de la etapa (1/2/3): el id real se resuelve aca con idEtapa(),
    // nunca se escribe a mano -- no hay seeder y los ids cambian de base en base.
    guardar: (nombre, tipoArquitecturaId, items, nivel) => {
      const etapaId = idEtapa(nivel)
      const filas = plantillaDesdeChecklist(items, etapaId)
      if (nombre.trim() === "" || tipoArquitecturaId === "" || etapaId === 0 || filas.length === 0) return
      guardarPlantillaChecklistMutation.mutate({
        nombre: nombre.trim(),
        tipoArquitectura: Number(tipoArquitecturaId),
        filas,
      })
    },
  }

  const [checklistPrimaria, setChecklistPrimaria] = useState<ChecklistItemEditable[]>([])
  const checklistPrimariaAcciones = fabricarManejadorLista(setChecklistPrimaria, CHECKLIST_ITEM_VACIO)
  const [pruebasPrimaria, setPruebasPrimaria] = useState<PruebaItemEditable[]>([])
  const pruebasPrimariaAcciones = fabricarManejadorLista(setPruebasPrimaria, PRUEBA_ITEM_VACIO)
  const [documentoPrimaria, setDocumentoPrimaria] = useState<DocumentoEditable>(DOCUMENTO_VACIO)
  const [avisoPrimaria, setAvisoPrimaria] = useState<AvisoVersionEditable>(AVISO_VERSION_VACIO)
  const [voBoPrimaria, setVoBoPrimaria] = useState<VoBoDTO | null>(null)

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

  useEffect(() => {
    if (accion !== "crear" || !catalogosListos) return
    const id = idEstadoPorDefecto()
    if (id === "") return
    for (const f of [form, formInscripcionSecundaria, formInscripcionUniversidad]) {
      if (f.state.values.estadoId === "") f.setFieldValue("estadoId", id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, catalogosListos])

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

  // ⭐ HTTP 2 de 2: TODO lo que va despues de la primaria, en una sola secuencia await tras await.
  async function enviarSecuenciaCadena(hastaPaso: number) {
    const primariaId = crearSolicitudMutation.data?.solicitud.id
    // ⭐ CANDADO: sin id de primaria no sale ni un HTTP del paso 2 (toda la cadena cuelga de ella).
    if (primariaId === undefined) {
      throw new Error("Todavía no se creó la solicitud de primaria")
    }

    // 📌 PASOS DINAMICOS: un paso que no existe no dispara su peticion (la secuencia HTTP se ajusta sola).
    const alcanza = (paso: PasoCadena) => {
      const indice = pasoDe(paso)
      return indice !== -1 && hastaPaso >= indice
    }

    if (alcanza("paneles-primaria")) {
      await guardarPanelesNivel(primariaId, checklistPrimaria, pruebasPrimaria, documentoPrimaria, avisoPrimaria)
      setVoBoPrimaria((await fetchSolicitud(primariaId)).voBo ?? null)
    }

    // ⭐ ENCADENADO: la secundaria nace con primariaId de padre, y la universidad exige secundariaId.
    let secundariaId = solicitudSecundariaId
    if (alcanza("datos-secundaria") && secundariaId === null) {
      const creada = await crearSolicitud({
        solicitud: armarSolicitudRequestDto(camposInscripcionSecundaria, idEtapa(2), primariaId),
        formacionesComplementarias: [],
      })
      secundariaId = creada.solicitud.id
      setSolicitudSecundariaId(secundariaId)
    }

    if (alcanza("paneles-secundaria") && secundariaId !== null) {
      await guardarPanelesNivel(secundariaId, checklistSecundaria, pruebasSecundaria, documentoSecundaria, avisoSecundaria)
      setVoBoSecundaria((await fetchSolicitud(secundariaId)).voBo ?? null)
    }

    let universidadId = solicitudUniversidadId
    if (alcanza("datos-universidad") && secundariaId !== null && universidadId === null) {
      const creada = await crearSolicitud({
        solicitud: armarSolicitudRequestDto(camposInscripcionUniversidad, idEtapa(3), secundariaId),
        formacionesComplementarias: [],
      })
      universidadId = creada.solicitud.id
      setSolicitudUniversidadId(universidadId)
    }

    if (alcanza("paneles-universidad") && universidadId !== null) {
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

  // ⭐ CONTROL DEL HTTP 2: un solo envio en vuelo -- su isPending bloquea botones y navegacion.
  const cadenaMutation = useMutation({
    mutationFn: enviarSecuenciaCadena,
    onSuccess: () => {
      desbloquearHasta(ultimoPaso)
      api?.scrollTo(pasoDe("confirmar-cadena"))
    },
  })

  function enviarCadena(hastaPaso: number) {
    cadenaMutation.mutate(hastaPaso)
  }

  function continuarCadena(siguientePaso: number) {
    desbloquearHasta(siguientePaso)
    api?.scrollTo(siguientePaso)
  }

  function resetearCadena() {
    const iniciales = accion === "crear" ? camposInicialesCrear() : CAMPOS_VACIOS

    setChecklistPrimaria([])
    setPruebasPrimaria([])
    setDocumentoPrimaria(DOCUMENTO_VACIO)
    setAvisoPrimaria(AVISO_VERSION_VACIO)
    setVoBoPrimaria(null)

    formInscripcionSecundaria.reset(iniciales)
    setSolicitudSecundariaId(null)
    setChecklistSecundaria([])
    setPruebasSecundaria([])
    setDocumentoSecundaria(DOCUMENTO_VACIO)
    setAvisoSecundaria(AVISO_VERSION_VACIO)
    setVoBoSecundaria(null)

    formInscripcionUniversidad.reset(iniciales)
    setSolicitudUniversidadId(null)
    setChecklistUniversidad([])
    setPruebasUniversidad([])
    setDocumentoUniversidad(DOCUMENTO_VACIO)
    setAvisoUniversidad(AVISO_VERSION_VACIO)
    setVoBoUniversidad(null)

    cadenaMutation.reset()
  }

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
    setBaseline?: (c: CamposFormulario) => void,
  ) {
    const camposNivel = dtoACampos(dto.solicitud)
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
      desbloquearHasta(ultimoPaso)
      api?.scrollTo(pasoDe("datos-primaria"))
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
      desbloquearHasta(ultimoPaso)
      api?.scrollTo(pasoDe("datos-primaria"))
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
  // ⭐ HTTP 2 (actualizar): un PUT por nivel, cada uno gateado por su propio id ya cargado.
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
  // ⭐ HTTP 2 (actualizar): paneles contra un id fijo -- el nivel ya existe, no se espera a nadie.
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

  // "actualizar"/"consultar" recorren la MISMA cadena completa (ver cargarActualizacion/
  // cargarConsulta) -- esta bandera es la unica diferencia real entre ambos al renderizar:
  // si ya esta todo cargado, sin importar cual de las 2 mutaciones lo hizo.
  const cadenaLista =
    (accion === "consultar" && consultarMutation.isSuccess) ||
    (accion === "actualizar" && actualizarCargaMutation.isSuccess)

  // ◽ RESUMEN -- EL CONTENIDO: que secciones/filas muestra el panel (lo unico a reescribir).
  // Resumen de "todo lo llenado hasta ahora" en la cadena -- cada seccion aparece cuando ese
  // nivel/panel REALMENTE tiene datos guardados (voBo/solicitudXId), no segun que paso este
  // desbloqueado: desde que crearSolicitudMutation desbloquea toda la cadena de un saque,
  // "maxStep" ya no sirve para esto (ver su onSuccess). Solo "crear" la tiene. ResumenCadena
  // decide por si mismo si se renderiza (no en mobile); aca solo se junta el contenido.
  // "Hay algo escrito" usa el MISMO criterio con el que guardarPanelesNivel decide que
  // filas manda: una fila en blanco no cuenta, asi que el resumen no muestra una seccion
  // pendiente por una fila vacia que el usuario agrego sin querer.
  function hayAlgoEnPaneles(
    checklist: ChecklistItemEditable[],
    pruebas: PruebaItemEditable[],
    documento: DocumentoEditable,
    aviso: AvisoVersionEditable,
  ): boolean {
    return (
      checklist.some((i) => i.seccion.trim() !== "" || i.actividad.trim() !== "") ||
      pruebas.some((i) => i.tipoPruebaId !== "" || i.ruta.trim() !== "") ||
      documento.completo ||
      documento.comentario.trim() !== "" ||
      aviso.reporte.trim() !== ""
    )
  }

  function filasDePaneles(
    checklist: ChecklistItemEditable[],
    pruebas: PruebaItemEditable[],
    documento: DocumentoEditable,
  ): FilaResumen[] {
    return [
      { etiqueta: "Checklist", valor: `${checklist.length} fila${checklist.length === 1 ? "" : "s"}` },
      { etiqueta: "Pruebas", valor: `${pruebas.length}` },
      { etiqueta: "Documentación", valor: documento.completo ? "Marcada" : "Sin marcar" },
    ]
  }

  const seccionesResumen: SeccionResumen[] = []

  function agregarSeccion(titulo: string, filas: FilaResumen[], pendiente = false) {
    seccionesResumen.push({ titulo, filas, pendiente })
  }

  if (accion === "crear") {
    // Cada nivel/panel aparece DOS veces posibles: como "guardado" cuando el backend ya lo
    // tiene, o como "sin enviar" cuando hay algo escrito que todavia no salio. Antes solo
    // existia la primera rama, y como "Continuar" no manda nada (solo mueve el carrusel),
    // el resumen se quedaba quieto mientras el usuario llenaba secundaria y universidad.
    if (crearSolicitudMutation.isSuccess) {
      const s = crearSolicitudMutation.data.solicitud
      agregarSeccion("Inscripción primaria", [
        { etiqueta: "Proyecto", valor: s.proyecto },
        { etiqueta: "Versión", valor: s.version },
        { etiqueta: "Estado", valor: s.estado },
      ])
    } else if (campos.proyecto.trim() !== "" || campos.version.trim() !== "") {
      agregarSeccion(
        "Inscripción primaria",
        [
          { etiqueta: "Proyecto", valor: campos.proyecto.trim() === "" ? "—" : campos.proyecto },
          { etiqueta: "Versión", valor: campos.version.trim() === "" ? "—" : campos.version },
        ],
        true,
      )
    }

    if (voBoPrimaria !== null) {
      agregarSeccion("Checklist/pruebas/documentación (primaria)", [
        { etiqueta: "Checklist", valor: voBoPrimaria.checklist ? "Completo" : "Pendiente" },
        { etiqueta: "Pruebas", valor: voBoPrimaria.pruebas ? "Completo" : "Pendiente" },
        { etiqueta: "Documentación", valor: voBoPrimaria.documentacion ? "Completo" : "Pendiente" },
      ])
    } else if (hayAlgoEnPaneles(checklistPrimaria, pruebasPrimaria, documentoPrimaria, avisoPrimaria)) {
      agregarSeccion(
        "Checklist/pruebas/documentación (primaria)",
        filasDePaneles(checklistPrimaria, pruebasPrimaria, documentoPrimaria),
        true,
      )
    }

    if (solicitudSecundariaId !== null) {
      agregarSeccion("Inscripción secundaria", [
        { etiqueta: "Proyecto", valor: camposInscripcionSecundaria.proyecto },
        { etiqueta: "Versión", valor: camposInscripcionSecundaria.version },
      ])
    } else if (camposInscripcionSecundaria.proyecto.trim() !== "" || camposInscripcionSecundaria.version.trim() !== "") {
      agregarSeccion(
        "Inscripción secundaria",
        [
          {
            etiqueta: "Proyecto",
            valor:
              camposInscripcionSecundaria.proyecto.trim() === "" ? "—" : camposInscripcionSecundaria.proyecto,
          },
          {
            etiqueta: "Versión",
            valor: camposInscripcionSecundaria.version.trim() === "" ? "—" : camposInscripcionSecundaria.version,
          },
        ],
        true,
      )
    }

    if (voBoSecundaria !== null) {
      agregarSeccion("Checklist/pruebas/documentación (secundaria)", [
        { etiqueta: "Checklist", valor: voBoSecundaria.checklist ? "Completo" : "Pendiente" },
        { etiqueta: "Pruebas", valor: voBoSecundaria.pruebas ? "Completo" : "Pendiente" },
        { etiqueta: "Documentación", valor: voBoSecundaria.documentacion ? "Completo" : "Pendiente" },
      ])
    } else if (
      hayAlgoEnPaneles(checklistSecundaria, pruebasSecundaria, documentoSecundaria, avisoSecundaria)
    ) {
      agregarSeccion(
        "Checklist/pruebas/documentación (secundaria)",
        filasDePaneles(checklistSecundaria, pruebasSecundaria, documentoSecundaria),
        true,
      )
    }

    if (solicitudUniversidadId !== null) {
      agregarSeccion("Inscripción universidad", [
        { etiqueta: "Proyecto", valor: camposInscripcionUniversidad.proyecto },
        { etiqueta: "Versión", valor: camposInscripcionUniversidad.version },
      ])
    } else if (
      camposInscripcionUniversidad.proyecto.trim() !== "" ||
      camposInscripcionUniversidad.version.trim() !== ""
    ) {
      agregarSeccion(
        "Inscripción universidad",
        [
          {
            etiqueta: "Proyecto",
            valor:
              camposInscripcionUniversidad.proyecto.trim() === "" ? "—" : camposInscripcionUniversidad.proyecto,
          },
          {
            etiqueta: "Versión",
            valor:
              camposInscripcionUniversidad.version.trim() === "" ? "—" : camposInscripcionUniversidad.version,
          },
        ],
        true,
      )
    }

    if (voBoUniversidad !== null) {
      agregarSeccion("Checklist/pruebas/documentación (universidad)", [
        { etiqueta: "Checklist", valor: voBoUniversidad.checklist ? "Completo" : "Pendiente" },
        { etiqueta: "Pruebas", valor: voBoUniversidad.pruebas ? "Completo" : "Pendiente" },
        { etiqueta: "Documentación", valor: voBoUniversidad.documentacion ? "Completo" : "Pendiente" },
      ])
    } else if (
      hayAlgoEnPaneles(checklistUniversidad, pruebasUniversidad, documentoUniversidad, avisoUniversidad)
    ) {
      agregarSeccion(
        "Checklist/pruebas/documentación (universidad)",
        filasDePaneles(checklistUniversidad, pruebasUniversidad, documentoUniversidad),
        true,
      )
    }
  }


  // Dos rects son "el mismo" si no se mueven ni un pixel: animar de un rect a si mismo no
  // dispara ninguna transicion, asi que el fantasma se montaria y no se desmontaria nunca
  // (lo cubre igual el temporizador de TransformacionPaso, pero mejor no montarlo).
  function mismoRect(a: DOMRect, b: DOMRect): boolean {
    return (
      Math.abs(a.top - b.top) < 1 &&
      Math.abs(a.left - b.left) < 1 &&
      Math.abs(a.width - b.width) < 1 &&
      Math.abs(a.height - b.height) < 1
    )
  }

  // ◽ RESUMEN -- LA ANIMACION (opcional: se puede copiar el resumen sin esto).
  // Cada vez que "Siguiente"/"Continuar" agrega una seccion nueva al Resumen, el paso que se
  // acaba de completar se "transforma" en esa fila: mide el Card del formulario ANTES de que
  // la fila nueva exista, y un frame despues mide la fila real, para animar el fantasma de un
  // rect al otro (el fantasma es <TransformacionPaso> en FormularioInscripciones.tsx -- es
  // puro JSX, lo unico de esto que se queda en el componente). No corre en el primer montaje
  // ni si el Resumen no esta montado (mobile): los dos refs los engancha el JSX.
  //
  // HOY ESTA APAGADA: el Card del formulario ya NO lleva "ref={cardRef}" (ver
  // FormularioInscripciones.tsx), y todo este efecto esta gateado por "cardRef.current", asi
  // que no corre. Para prenderla, poner el ref de vuelta -- es una sola linea.
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
      // Card sin tamaño (colapsado por una cadena de alturas incompleta, o todavia sin
      // layout): no hay nada que animar y un fantasma de 0x0 no transiciona.
      if (desde.width === 0 || desde.height === 0) {
        seccionesAnteriorRef.current = seccionesResumen.length
        return
      }
      const cuadro = requestAnimationFrame(() => {
        // querySelector por data-slot: depende de que el Resumen sea un Card de shadcn
        // NUEVO (los viejos no emiten data-slot). Si no lo encuentra, no anima y listo.
        const contenido = resumenRef.current?.querySelector('[data-slot="card-content"]')
        const filaNueva = contenido?.lastElementChild
        if (filaNueva) {
          const hasta = filaNueva.getBoundingClientRect()
          if (hasta.width > 0 && hasta.height > 0 && !mismoRect(desde, hasta)) {
            setTransformacion({ desde, hasta })
          }
        }
      })
      seccionesAnteriorRef.current = seccionesResumen.length
      return () => cancelAnimationFrame(cuadro)
    }
    seccionesAnteriorRef.current = seccionesResumen.length
  }, [seccionesResumen.length])

  function limpiarTransformacion() {
    setTransformacion(null)
  }

  return {
    accion,
    elegirAccion,
    empezarDeNuevo,

    // ◽ RESUMEN: todo este grupo.
    esEscritorio,
    resumenPanelRef,
    resumenColapsado,
    setResumenColapsado,
    alternarResumen,
    cardRef,
    resumenRef,
    transformacion,
    limpiarTransformacion,

    api,
    setApi,
    current,
    maxStep,
    irAPaso,
    anterior,

    // El flujo (que pasos hay y en que posicion) -- la pagina monta sus slides con esto y
    // pregunta indices con pasoDe/trasPaso, nunca escribe un numero de paso.
    // 📌 PASOS DINAMICOS: todo este grupo.
    llevaPaneles,
    pasos,
    ultimoPaso,
    pasoDe,
    trasPaso,
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
    // 🔳 CLONAR: todo este grupo.
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
    seccionesResumen, // ◽ RESUMEN

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
    cadenaLista,
  }
}

export type InscripcionFormApi = ReturnType<typeof useInscripcionForm>

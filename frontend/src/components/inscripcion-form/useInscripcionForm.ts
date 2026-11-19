import { useEffect, useRef, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  actualizarChecklistItem,
  actualizarInscripcion,
  actualizarPruebaItem,
  CATALOGOS_INSCRIPCION_QUERY,
  crearChecklistItem,
  crearPruebaItem,
  crearSolicitud,
  fetchInscripcion,
  fetchInscripciones,
  fetchSolicitud,
  guardarAvisoVersiones,
  guardarDocumento,
} from "@/api/client"
import type {
  ChecklistItemRequestDTO,
  FormacionComplementariaRequestDTO,
  InscripcionDTO,
  InscripcionRequestDTO,
  PruebaRequestDTO,
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
  // del front (bind de los <select>) -- InscripcionRequestDTO ya no usa el sufijo "Id"
  // (estado/sistema/..., espejo de InscripcionRequestDto.java), por eso el renombre aca.
  // Solo lo sigue usando "actualizar" (edita InscripcionEty legacy, ver mas abajo).
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

  // Mismo renombre, pero para SolicitudRequestDTO (SOL_N_INSCRIPCION) -- usado por "crear"
  // (cualquier nivel) y por la continuación de la cadena.
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

  function elegirAccion(nueva: Accion) {
    setAccion(nueva)
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
  }

  // --- Catalogos ("tablas genericas") -- en UNA sola llamada (via axios), compartiendo
  // cache de TanStack Query con HomePage.tsx. "lista" esta incluida en el gate aunque
  // FormularioPagoPage nunca la dispare -- es una rama muerta inofensiva ahi, y necesaria en
  // InscripcionWizard (sus 3 filtros tambien dependen de estos catalogos).
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

  // --- Lista completa -- usada por "lista" (con los 3 filtros de arriba) y por
  // "actualizar" (elegir de que solicitud partir, sin filtros). "actualizar" SOLO edita
  // solicitudes legacy (tabla INSCRIPCION, creadas antes de este cambio) -- las creadas por
  // el modelo nuevo (SOL_N_INSCRIPCION) no tienen cadena que continuar desde aca, ver
  // comentario de types.ts/etiquetaPaso.
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
      desbloquearHasta(1)
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

  // --- Actualizar: elegir la solicitud, despues editarla -- SOLO solicitudes legacy
  // (InscripcionEty/tabla INSCRIPCION), sin tocar nada de este archivo mas alla de quitar
  // el enganche a la cadena vieja (ver comentario arriba de useInscripciones). ---
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

  // Una vez que llega la solicitud elegida y los catalogos ya estan cargados, se arma el
  // "baseline": los mismos 11 campos pero resueltos a partir del DTO (que trae texto, no
  // ids).
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
    desbloquearHasta(1)
    api?.scrollTo(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, buscarInscripcionMutation.isSuccess, buscarInscripcionMutation.data, catalogosListos, solicitudIdActual])

  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)
  const huboCambiosFormaciones =
    JSON.stringify(formacionesEditables) !== JSON.stringify(formacionesOriginalRef.current)
  const hayAlgoQueGuardar = huboCambios || huboCambiosFormaciones

  // UNA sola peticion HTTP tambien para editar: mismo shape compuesto que
  // crearSolicitudConFormaciones() -- formacionesComplementarias es la lista
  // COMPLETA que debe quedar, el backend sincroniza solo (borra lo que falte,
  // actualiza lo que tenga id, crea lo que no) -- ver InscripcionServiceImpl.
  // actualizar(). Sigue contra /inscripciones (legacy): esta rama no toca
  // SOL_N_INSCRIPCION para nada.
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
    crearSolicitudMutation.reset()
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

  // --- Cadena Primaria/Secundaria/Universidad (SOLO "crear" -- ver comentario en
  // types.ts/etiquetaPaso sobre por que "actualizar" no la tiene). Reemplaza al viejo
  // checklist fijo de firmas booleanas por checklist/pruebas/documento/aviso de versiones
  // dinamicos (ver InscripcionChecklistEty/InscripcionPruebaEty/InscripcionDocumentoEty/
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
      setVoBoPrimaria((await fetchSolicitud(primariaId)).voBo)
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
      setVoBoSecundaria((await fetchSolicitud(secundariaId)).voBo)
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
      setVoBoUniversidad((await fetchSolicitud(universidadId)).voBo)
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

  // Resumen de "todo lo llenado hasta ahora" en la cadena -- segun maxStep (el paso mas
  // lejano ya desbloqueado), no "current": si el usuario vuelve a un paso anterior, lo ya
  // llenado mas adelante sigue apareciendo aca. Solo "crear" la tiene (ver comentario en
  // types.ts sobre "actualizar"). ResumenCadena decide por si mismo si se renderiza (no en
  // mobile); aca solo se junta el contenido.
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
    if (maxStep >= 3) {
      seccionesResumen.push({
        titulo: "Checklist/pruebas/documentación (primaria)",
        filas: [
          { etiqueta: "Checklist", valor: voBoPrimaria?.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoPrimaria?.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoPrimaria?.documentacion ? "Completo" : "Pendiente" },
        ],
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
        titulo: "Checklist/pruebas/documentación (secundaria)",
        filas: [
          { etiqueta: "Checklist", valor: voBoSecundaria?.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoSecundaria?.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoSecundaria?.documentacion ? "Completo" : "Pendiente" },
        ],
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
        titulo: "Checklist/pruebas/documentación (universidad)",
        filas: [
          { etiqueta: "Checklist", valor: voBoUniversidad?.checklist ? "Completo" : "Pendiente" },
          { etiqueta: "Pruebas", valor: voBoUniversidad?.pruebas ? "Completo" : "Pendiente" },
          { etiqueta: "Documentación", valor: voBoUniversidad?.documentacion ? "Completo" : "Pendiente" },
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
    tiposPruebaQuery,
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

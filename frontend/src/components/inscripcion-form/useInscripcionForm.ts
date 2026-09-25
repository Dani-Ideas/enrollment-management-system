import { useEffect, useRef, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import type { InscripcionRequestDTO } from "@/api/types"
import type { CarouselApi } from "@/components/ui/carousel"
import { type Accion, type CamposFormulario, type FormacionComplementariaEditable, CAMPOS_VACIOS, aInputDatetime } from "./types"

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

  const catalogoCompleto = campos.estadoId !== "" && campos.sistemaId !== "" && campos.ambienteId !== ""
  const responsablesCompletos =
    campos.jefeCarreraId !== "" && campos.maestroId !== "" && campos.carreraId !== ""
  const datosProyectoCompletos =
    campos.proyecto.trim() !== "" && campos.version.trim() !== "" && campos.fechaPlanteada !== ""
  const formularioCompleto = catalogoCompleto && responsablesCompletos && datosProyectoCompletos

  function elegirAccion(nueva: Accion) {
    setAccion(nueva)
    desbloquearHasta(1)
    api?.scrollTo(1)
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

  // --- Lista completa -- usada por "lista" (con filtros, manejados fuera de
  // este hook) y por "actualizar" (elegir de que solicitud partir, sin
  // filtros). staleTime corto: a diferencia de los catalogos, esta es la
  // lista de las SOLICITUDES mismas. Los filtros se pasan desde afuera
  // (InscripcionWizard) porque son exclusivos de la rama "lista".
  function useInscripciones(filtros?: { estadoId: string; sistemaId: string; ambienteId: string }) {
    return useQuery({
      queryKey:
        accion === "lista" && filtros
          ? ["inscripciones", filtros.estadoId, filtros.sistemaId, filtros.ambienteId]
          : ["inscripciones"],
      queryFn: () =>
        fetchInscripciones(
          accion === "lista" && filtros
            ? {
                estadoId: filtros.estadoId === "" ? undefined : Number(filtros.estadoId),
                sistemaId: filtros.sistemaId === "" ? undefined : Number(filtros.sistemaId),
                ambienteId: filtros.ambienteId === "" ? undefined : Number(filtros.ambienteId),
              }
            : undefined,
        ),
      enabled: accion === "lista" || accion === "actualizar",
      staleTime: 10 * 1000,
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

  // Se dispara SOLO despues de que crearInscripcionMutation ya confirmo la
  // Inscripcion -- recien ahi existe el id real que necesita cada formación
  // complementaria como FK. Un solo POST por formación complementaria (no
  // hay bulk-create en el backend).
  const crearFormacionesMutation = useMutation({
    mutationFn: (args: { inscripcionId: number; items: FormacionComplementariaEditable[] }) =>
      Promise.all(
        args.items.map((item) =>
          crearFormacionComplementaria({ inscripcionId: args.inscripcionId, descripcion: item.descripcion }),
        ),
      ),
  })

  const crearInscripcionMutation = useMutation({
    mutationFn: crearInscripcion,
    onSuccess: (creada) => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      const items = formacionesNuevas.filter((el) => el.descripcion.trim() !== "")
      if (items.length > 0) {
        crearFormacionesMutation.mutate({ inscripcionId: creada.id, items })
      }
      desbloquearHasta(4)
      api?.scrollTo(4)
    },
  })

  function crearOtra() {
    form.reset()
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

  const formacionesQuery = useQuery({
    queryKey: ["formaciones-complementarias", solicitudIdActual],
    queryFn: () => fetchFormacionesComplementariasPorInscripcion(solicitudIdActual!),
    enabled: accion === "actualizar" && solicitudIdActual !== null,
  })

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

  // Una vez que llega la solicitud elegida, sus formaciones complementarias,
  // Y los 4 catalogos ya estan cargados, se arma el "baseline": los mismos
  // 11 campos pero resueltos a partir del DTO (que trae texto, no ids).
  useEffect(() => {
    if (accion !== "actualizar") return
    if (!buscarInscripcionMutation.isSuccess || !catalogosListos || !formacionesQuery.isSuccess) return
    if (baselineIdRef.current === solicitudIdActual) return
    baselineIdRef.current = solicitudIdActual

    const dto = buscarInscripcionMutation.data
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
    const formacionesIniciales = formacionesQuery.data.map((el) => ({ id: el.id, descripcion: el.descripcion }))
    formacionesOriginalRef.current = formacionesIniciales
    setFormacionesEditables(formacionesIniciales)
    setBaseline(nuevoBaseline)
    form.reset(nuevoBaseline)
    desbloquearHasta(2)
    api?.scrollTo(2)
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

  const huboCambios = baseline !== null && JSON.stringify(campos) !== JSON.stringify(baseline)
  const huboCambiosFormaciones =
    JSON.stringify(formacionesEditables) !== JSON.stringify(formacionesOriginalRef.current)
  const hayAlgoQueGuardar = huboCambios || huboCambiosFormaciones

  const actualizarInscripcionMutation = useMutation({
    mutationFn: (dto: InscripcionRequestDTO) => actualizarInscripcion(solicitudIdActual!, dto),
  })

  // Sincroniza la lista de formaciones complementarias contra lo que se
  // tenia antes: crea los que se agregaron (id null), actualiza los que
  // cambiaron de texto, borra los que ya no estan.
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
      buscarInscripcionMutation.mutate(solicitudIdActual)
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
    form.reset()
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

  // Reset comun a los dos wizards -- el que tiene rama "lista" (filtros,
  // detalle abierto) envuelve esta funcion para resetear tambien SU estado
  // local propio (ver InscripcionWizardTanstack).
  function empezarDeNuevo() {
    setAccion(null)
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
    crearFormacionesMutation.reset()
    setFormacionesEditables([])
    formacionesOriginalRef.current = []
    setGuardadoConfirmado(false)
    sincronizarFormacionesMutation.reset()
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

    huboCambios,
    huboCambiosFormaciones,
    hayAlgoQueGuardar,
    actualizarInscripcionMutation,
    sincronizarFormacionesMutation,
    guardarCambios,
    guardadoConfirmado,
    actualizarOtra,
  }
}

export type InscripcionFormApi = ReturnType<typeof useInscripcionForm>

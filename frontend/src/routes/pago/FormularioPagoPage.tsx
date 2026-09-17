import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {
  crearMatricula,
  fetchClasesPorMateria,
  fetchEstudiante,
  fetchMateriasPorCarrera,
} from "@/api/client"
import type { EstudianteDTO, MateriaDTO, MatriculaDTO } from "@/api/types"
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  SearchIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react"

const PASOS = ["Identificación", "Selección", "Evaluación", "Confirmación"] as const
const ANIOS = [1, 2, 3, 4, 5] as const

// ============================================================================
// BASE REUTILIZADA: el "carrusel con pasos bloqueados" (indicador de arriba +
// Carousel de shadcn + api.scrollTo()) es la MISMA estructura que ya usaba esta
// pagina en HelloJakarta-variante para el formulario de pago simulado. Lo que
// cambia es QUE dispara el avance de paso: alla, un timer (setTimeout) avanzaba
// solo cuando un campo quedaba valido ("autoavance"); aca, el avance lo dispara
// el "onSuccess" de una llamada real al backend (buscar estudiante, elegir
// clase) -- no tiene sentido "esperar a que el usuario deje de escribir" cuando
// lo que estamos esperando es la respuesta de una peticion HTTP real.
// ============================================================================
export function FormularioPagoPage() {
  // --- Estado de REACT puro (vive solo en este componente, se pierde si
  // recargas la pagina) -- identifica en que paso del tramite estamos y que
  // eligio el usuario hasta ahora. Nada de esto es "cache de servidor": es
  // estado de FORMULARIO/UI, por eso es useState y no useQuery.
  const [estudianteIdInput, setEstudianteIdInput] = useState("")
  const [estudiante, setEstudiante] = useState<EstudianteDTO | null>(null)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaDTO | null>(null)
  const [matriculaCreada, setMatriculaCreada] = useState<MatriculaDTO | null>(null)

  // --- Mecanica del carrusel (identica a la version original) ---
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  // maxStepRef/currentRef: espejo en ref de current/maxStep. El listener "select"
  // de Embla (la libreria que usa el Carousel de shadcn por debajo) puede
  // dispararse en el MISMO tick en que llamamos api.scrollTo(), antes de que
  // React vuelva a renderizar con el nuevo estado -- si ese listener leyera
  // maxStep/current del closure (el valor de la render anterior), se confundiria
  // y regresaria el carrusel al paso viejo justo despues de desbloquear el nuevo.
  // Con refs, siempre lee el valor mas reciente sin esperar al re-render (mismo
  // bug/fix que ya estaba documentado en la version original de este archivo).
  const maxStepRef = useRef(0)
  const currentRef = useRef(0)

  function desbloquearHasta(destino: number) {
    maxStepRef.current = Math.max(maxStepRef.current, destino)
    setMaxStep(maxStepRef.current)
  }

  // Si el usuario arrastra/usa el teclado y llega a un paso todavia no
  // desbloqueado, lo regresamos -- la unica forma de avanzar es que el backend
  // confirme cada etapa (buscar estudiante, matricularse), nunca por swipe.
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

  // ============================================================================
  // TANSTACK QUERY -- necesitamos acceso al QueryClient (el "almacen" central de
  // cache que se creo UNA sola vez en main.tsx con <QueryClientProvider>) para
  // poder invalidar manualmente una query desde un evento (ver
  // matricularMutation.onSuccess mas abajo).
  // ============================================================================
  const queryClient = useQueryClient()

  // --- Paso 0: identificar al estudiante -----------------------------------
  // useMutation: para acciones que CAMBIAN algo o son disparadas por un evento
  // puntual del usuario (un click), no datos que la pagina necesita "tener
  // siempre listos". Aunque tecnicamente esto es una LECTURA (GET
  // /estudiantes/{id}), se modela como mutation -- y no como query -- porque
  // solo queremos que se ejecute cuando el usuario hace click en "Buscar", no
  // automaticamente ni en cuanto haya un id escrito.
  const buscarEstudianteMutation = useMutation({
    mutationFn: fetchEstudiante, // = (id: number) => Promise<EstudianteDTO>
    onSuccess: (data) => {
      setEstudiante(data)
      desbloquearHasta(1)
      api?.scrollTo(1)
    },
  })

  function buscarEstudiante() {
    const id = Number(estudianteIdInput)
    if (!Number.isInteger(id) || id <= 0) return
    buscarEstudianteMutation.mutate(id)
  }

  function cambiarDeEstudiante() {
    setEstudiante(null)
    setMateriaSeleccionada(null)
    setMatriculaCreada(null)
    setEstudianteIdInput("")
    buscarEstudianteMutation.reset()
    maxStepRef.current = 0
    setMaxStep(0)
    api?.scrollTo(0)
  }

  // --- Paso 1: plan de estudio (materias de la carrera del estudiante) -----
  // useQuery, a diferencia de la mutation de arriba: esto SI es "un dato que la
  // pagina necesita tener listo" mientras el usuario esta en este paso, no una
  // accion puntual. TanStack Query se encarga solo de: pedirlo la primera vez,
  // GUARDARLO en cache bajo la queryKey, y (esto es lo importante para "evitar
  // molestar la base de datos") si volves a este paso mas tarde con la MISMA
  // queryKey, te devuelve el dato cacheado al instante en vez de pedirlo de
  // nuevo -- solo vuelve a pedirlo si el dato ya quedo "stale" (viejo).
  //
  // enabled: la query NO se dispara sola apenas se monta el componente -- se
  // queda inactiva hasta que la condicion sea true (recien cuando ya
  // identificamos al estudiante Y estamos en el paso 1). Sin esto, TanStack
  // Query intentaria pedir materias con carreraId=undefined apenas cargara la
  // pagina, antes de que el usuario buscara a nadie.
  //
  // staleTime: 5 minutos. Justificacion del valor -- Materia es dato ESTATICO
  // (se siembra una vez en DatosIniciales, nadie lo edita desde la UI, ver
  // MateriaController: solo tiene GET). No tiene sentido re-pedirlo a cada
  // rato "por las dudas" -- con staleTime largo, si el estudiante va y viene
  // entre pasos, TanStack Query sirve el array ya cacheado sin tocar la red ni
  // la base de datos, hasta que pasen esos 5 minutos.
  const materiasQuery = useQuery({
    queryKey: ["materias", estudiante?.carreraId],
    queryFn: () => fetchMateriasPorCarrera(estudiante!.carreraId),
    enabled: estudiante !== null && current >= 1,
    staleTime: 5 * 60 * 1000,
  })

  function elegirMateria(materia: MateriaDTO) {
    matricularMutation.reset()
    setMateriaSeleccionada(materia)
    desbloquearHasta(2)
    api?.scrollTo(2)
  }

  // --- Paso 2: clases (ofertas reales) de la materia elegida ---------------
  // Misma logica de useQuery que arriba, pero con un staleTime MUCHO mas corto
  // (10 segundos) -- a diferencia de Materia, "cuposDisponibles" de una Clase
  // cambia cada vez que CUALQUIER estudiante se matricula (no solo el que esta
  // usando esta pantalla ahora mismo). Un staleTime largo aca mostraria cupos
  // desactualizados si otra persona se anoto hace un rato. 10s es un balance:
  // sigue evitando pedirlo en cada tecla/render, pero no se queda "viejo" por
  // mucho tiempo. (Ver tambien invalidateQueries en matricularMutation.onSuccess
  // -- esa es la otra mitad de la estrategia: refrescar YA, sin esperar a que
  // venza el staleTime, apenas sabemos con certeza que los cupos cambiaron.)
  const clasesQuery = useQuery({
    queryKey: ["clases", materiaSeleccionada?.id],
    queryFn: () => fetchClasesPorMateria(materiaSeleccionada!.id),
    enabled: materiaSeleccionada !== null && current >= 2,
    staleTime: 10 * 1000,
  })

  // "Deseleccion": vuelve al paso 1 sin haber creado ninguna Matricula todavia
  // -- nada de lo que paso en el paso 2 se persistio en la base de datos, asi
  // que no hay nada que "deshacer" en el backend, solo volvemos en la UI.
  function deseleccionar() {
    setMateriaSeleccionada(null)
    matricularMutation.reset()
    irAPaso(1)
  }

  // --- Inscripcion: POST /matriculas real -----------------------------------
  // Otra mutation (accion puntual: "el usuario decidio inscribirse AHORA").
  const matricularMutation = useMutation({
    mutationFn: crearMatricula, // = (dto: MatriculaRequestDTO) => Promise<MatriculaDTO>
    onSuccess: (data) => {
      setMatriculaCreada(data)
      // invalidateQueries: le dice a TanStack Query "lo que tengas cacheado
      // bajo esta queryKey ya no es confiable, volve a pedirlo la proxima vez
      // que se use" -- se usa aca porque ACABAMOS de crear una Matricula, o
      // sea que "cuposDisponibles" de esta Clase con certeza bajo en 1. Sin
      // esto, si el usuario elige "Inscribir otra materia" y despues vuelve a
      // pasar por esta misma Clase, veria el cupo viejo hasta que se cumplieran
      // los 10s de staleTime de arriba.
      queryClient.invalidateQueries({ queryKey: ["clases", materiaSeleccionada?.id] })
      desbloquearHasta(3)
      api?.scrollTo(3)
    },
  })

  function inscribirseEnClase(claseId: number) {
    if (!estudiante) return
    matricularMutation.mutate({ estudianteId: estudiante.id, claseId })
  }

  function inscribirOtraMateria() {
    setMateriaSeleccionada(null)
    setMatriculaCreada(null)
    matricularMutation.reset()
    maxStepRef.current = 1
    setMaxStep(1)
    api?.scrollTo(1)
  }

  // Materias agrupadas por anio (1..5) -- arma la forma de "mapa curricular"
  // (5 materias por anio) a partir del array plano que devuelve el backend.
  // Esto es puro calculo derivado del estado/cache de arriba -- no es estado
  // propio, no necesita useState: se recalcula en cada render, es barato.
  const materiasPorAnio = new Map<number, MateriaDTO[]>()
  for (const materia of materiasQuery.data ?? []) {
    const lista = materiasPorAnio.get(materia.anio) ?? []
    lista.push(materia)
    materiasPorAnio.set(materia.anio, lista)
  }

  return (
    <section className="max-w-2xl">
      {/* TanStack ROUTER: <Link> intercepta el click y cambia la URL via el
          History API del navegador, sin recargar la pagina -- lee "basepath"
          de router.tsx (aca, "/SistemaMatriculas") para armar el href real. */}
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link to="/">
          <ArrowLeftIcon />
          Volver al menú principal
        </Link>
      </Button>

      <h2>Inscripción a materias</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Identificate, elegí una materia de tu carrera, revisá quién la dicta y si hay
        cupo, y confirmá tu inscripción -- esto crea una Matrícula real en la base de
        datos.
      </p>

      {/* Indicador de pasos: igual que en la version original, cada boton se
          habilita/deshabilita segun "maxStep" (hasta donde ya se desbloqueo). */}
      <NavigationMenu viewport={false} className="mb-4 max-w-none justify-start">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {PASOS.map((titulo, indice) => {
            const desbloqueado = indice <= maxStep
            const esActual = indice === current
            return (
              <NavigationMenuItem key={titulo}>
                <button
                  type="button"
                  disabled={!desbloqueado}
                  onClick={() => irAPaso(indice)}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    esActual && "bg-muted font-semibold text-foreground",
                    !desbloqueado && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-xs",
                      esActual
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
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
          {/* Carousel de shadcn (usa Embla por debajo) -- watchDrag: false
              porque el avance solo lo controla el codigo (via api.scrollTo()),
              nunca el arrastre/swipe del usuario (ver el useEffect de arriba
              que "regresa" si detecta un intento de saltarse un paso). */}
          <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full">
            <CarouselContent>
              {/* --- CarouselItem 0: Identificacion --- */}
              <CarouselItem>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="estudiante-id">ID de estudiante</FieldLabel>
                    <Input
                      id="estudiante-id"
                      type="number"
                      min="1"
                      value={estudianteIdInput}
                      onChange={(e) => setEstudianteIdInput(e.target.value)}
                      placeholder="Ej. 1"
                    />
                    <FieldDescription>
                      Sin login todavía -- ingresá el id numérico del estudiante (los
                      sembrados por DatosIniciales van del 1 al 3).
                    </FieldDescription>
                  </Field>

                  {buscarEstudianteMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se encontró el estudiante</AlertTitle>
                      <AlertDescription>Revisá el id e intentá de nuevo.</AlertDescription>
                    </Alert>
                  )}
                </FieldGroup>
              </CarouselItem>

              {/* --- CarouselItem 1: Seleccion de materia --- */}
              <CarouselItem>
                <div className="space-y-4">
                  {estudiante && (
                    <div className="flex items-center justify-between rounded-lg border border-input p-3">
                      <div className="flex items-center gap-2">
                        <UserRoundIcon className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{estudiante.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {estudiante.carreraNombre}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={cambiarDeEstudiante}>
                        Cambiar de estudiante
                      </Button>
                    </div>
                  )}

                  <h3 className="text-sm font-medium">Plan de estudio</h3>

                  {materiasQuery.isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner /> Cargando materias…
                    </div>
                  )}

                  {materiasQuery.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudieron cargar las materias</AlertTitle>
                      <AlertDescription>
                        {(materiasQuery.error as Error).message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {ANIOS.map((anio) => {
                    const materias = materiasPorAnio.get(anio) ?? []
                    if (materias.length === 0) return null
                    return (
                      <div key={anio} className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Año {anio}
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {materias.map((materia) => (
                            <button
                              key={materia.id}
                              type="button"
                              onClick={() => elegirMateria(materia)}
                              className="rounded-lg border border-input p-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5"
                            >
                              {materia.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CarouselItem>

              {/* --- CarouselItem 2: Evaluacion + Inscripcion/Deseleccion --- */}
              <CarouselItem>
                <div className="space-y-4">
                  {materiaSeleccionada && (
                    <div>
                      <h3 className="text-sm font-medium">{materiaSeleccionada.nombre}</h3>
                      <p className="text-xs text-muted-foreground">
                        Año {materiaSeleccionada.anio}
                      </p>
                    </div>
                  )}

                  {clasesQuery.isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner /> Buscando clases disponibles…
                    </div>
                  )}

                  {clasesQuery.data?.length === 0 && (
                    <Alert>
                      <TriangleAlertIcon />
                      <AlertTitle>Todavía no hay clases para esta materia</AlertTitle>
                      <AlertDescription>
                        Elegí otra materia o volvé más tarde.
                      </AlertDescription>
                    </Alert>
                  )}

                  {clasesQuery.data?.map((clase) => (
                    <div
                      key={clase.id}
                      className="flex items-center justify-between rounded-lg border border-input p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{clase.profesor.nombre}</p>
                        <Badge
                          variant={clase.cuposDisponibles > 0 ? "secondary" : "destructive"}
                        >
                          {clase.cuposDisponibles > 0
                            ? `${clase.cuposDisponibles} cupo(s) disponible(s)`
                            : "Sin cupo"}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        disabled={clase.cuposDisponibles === 0 || matricularMutation.isPending}
                        onClick={() => inscribirseEnClase(clase.id)}
                      >
                        Inscribirme
                      </Button>
                    </div>
                  ))}

                  {matricularMutation.isError && (
                    <Alert variant="destructive">
                      <TriangleAlertIcon />
                      <AlertTitle>No se pudo completar la inscripción</AlertTitle>
                      <AlertDescription>
                        {(matricularMutation.error as Error).message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button variant="outline" onClick={deseleccionar}>
                    Volver a elegir materia
                  </Button>
                </div>
              </CarouselItem>

              {/* --- CarouselItem 3: Confirmacion --- */}
              <CarouselItem>
                <div className="space-y-4">
                  {matriculaCreada && (
                    <>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Inscripción confirmada</AlertTitle>
                        <AlertDescription>
                          Quedaste matriculado en {matriculaCreada.clase.materia.nombre}.
                        </AlertDescription>
                      </Alert>

                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                        <dt className="text-muted-foreground">Materia</dt>
                        <dd>{matriculaCreada.clase.materia.nombre}</dd>
                        <dt className="text-muted-foreground">Profesor</dt>
                        <dd>{matriculaCreada.clase.profesor.nombre}</dd>
                        <dt className="text-muted-foreground">Estado</dt>
                        <dd>{matriculaCreada.estado}</dd>
                        <dt className="text-muted-foreground">Fecha de inscripción</dt>
                        <dd>{matriculaCreada.fechaInscripcion}</dd>
                      </dl>

                      <Button onClick={inscribirOtraMateria}>Inscribir otra materia</Button>
                    </>
                  )}
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </CardContent>

        <CardFooter className="justify-between">
          <Button variant="outline" onClick={anterior} disabled={current === 0}>
            Atrás
          </Button>
          {current === 0 && (
            <Button
              onClick={buscarEstudiante}
              disabled={buscarEstudianteMutation.isPending || estudianteIdInput.trim() === ""}
            >
              <SearchIcon />
              Buscar
            </Button>
          )}
        </CardFooter>
      </Card>
    </section>
  )
}

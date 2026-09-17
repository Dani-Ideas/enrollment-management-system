import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  crearMatricula,
  fetchClasesPorMateria,
  fetchEstudiante,
  fetchMateriasPorCarrera,
} from "@/api/client"
import type { EstudianteDTO, MateriaDTO, MatriculaDTO } from "@/api/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  CheckCircle2Icon,
  SearchIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react"

const ANIOS = [1, 2, 3, 4, 5] as const

// ============================================================================
// ESPEJO de FormularioPagoPage.tsx: MISMOS datos, MISMAS llamadas al backend,
// MISMA logica de TanStack Query/Mutation -- la unica diferencia real es la
// forma de PRESENTAR los pasos. Alla, cada paso vive en un CarouselItem y solo
// se ve uno a la vez (con api.scrollTo() para pasar de uno a otro). Aca no hay
// Carousel en absoluto: las secciones son <div> normales, una debajo de la
// otra, en el flujo normal del documento -- cada una aparece (con scroll hacia
// abajo, como cualquier formulario largo tradicional) en cuanto la anterior ya
// esta resuelta. No hay "current"/"maxStep"/api.scrollTo() aca porque no hace
// falta bloquear nada por swipe/teclado -- sin Carousel, no hay gesto que
// pueda saltarse un paso.
//
// Los comentarios sobre POR QUE cada useQuery/useMutation esta armado asi
// (staleTime, enabled, invalidateQueries) son los mismos que en
// FormularioPagoPage.tsx -- no se repiten linea por linea aca, ver ese archivo
// para el detalle completo de cada decision.
// ============================================================================
export function FormularioLargoPage() {
  const [estudianteIdInput, setEstudianteIdInput] = useState("")
  const [estudiante, setEstudiante] = useState<EstudianteDTO | null>(null)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaDTO | null>(null)
  const [matriculaCreada, setMatriculaCreada] = useState<MatriculaDTO | null>(null)

  const queryClient = useQueryClient()

  // --- Identificacion ---
  const buscarEstudianteMutation = useMutation({
    mutationFn: fetchEstudiante,
    onSuccess: (data) => setEstudiante(data),
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
  }

  // --- Seleccion: plan de estudio de la carrera del estudiante ---
  // enabled solo depende de "estudiante !== null" -- no hace falta un
  // equivalente a "current >= 1" (no hay pasos numerados aca), la condicion
  // real siempre fue "ya sabemos la carrera de alguien", eso no cambia.
  const materiasQuery = useQuery({
    queryKey: ["materias", estudiante?.carreraId],
    queryFn: () => fetchMateriasPorCarrera(estudiante!.carreraId),
    enabled: estudiante !== null,
    staleTime: 5 * 60 * 1000,
  })

  function elegirMateria(materia: MateriaDTO) {
    matricularMutation.reset()
    setMateriaSeleccionada(materia)
  }

  // --- Evaluacion: clases (con profesor y cupos) de la materia elegida ---
  const clasesQuery = useQuery({
    queryKey: ["clases", materiaSeleccionada?.id],
    queryFn: () => fetchClasesPorMateria(materiaSeleccionada!.id),
    enabled: materiaSeleccionada !== null,
    staleTime: 10 * 1000,
  })

  // "Deseleccion": sin Matricula creada todavia, no hay nada que deshacer en
  // el backend -- solo se limpia el estado local y la seccion de Evaluacion
  // desaparece (React dejar de renderizarla), volviendo a mostrar solo hasta
  // Seleccion.
  function deseleccionar() {
    setMateriaSeleccionada(null)
    matricularMutation.reset()
  }

  // --- Inscripcion ---
  const matricularMutation = useMutation({
    mutationFn: crearMatricula,
    onSuccess: (data) => {
      setMatriculaCreada(data)
      queryClient.invalidateQueries({ queryKey: ["clases", materiaSeleccionada?.id] })
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
  }

  const materiasPorAnio = new Map<number, MateriaDTO[]>()
  for (const materia of materiasQuery.data ?? []) {
    const lista = materiasPorAnio.get(materia.anio) ?? []
    lista.push(materia)
    materiasPorAnio.set(materia.anio, lista)
  }

  return (
    <section>
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-y bg-background/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/75">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inscripción (formulario completo)</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h2>Opción 3 · Inscripción, formulario completo</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Mismo trámite que "Inscripción" (Opción 2), mismas llamadas reales al backend --
        acá sin carrusel: cada sección aparece debajo de la anterior a medida que la vas
        completando, en vez de pasar de pantalla en pantalla.
      </p>

      <Card className="max-w-xl">
        <CardContent className="space-y-6">
          {/* --- Seccion: Identificacion (siempre visible) --- */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="estudiante-id-largo">ID de estudiante</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="estudiante-id-largo"
                  type="number"
                  min="1"
                  value={estudianteIdInput}
                  onChange={(e) => setEstudianteIdInput(e.target.value)}
                  placeholder="Ej. 1"
                  disabled={estudiante !== null}
                />
                {estudiante === null ? (
                  <Button
                    onClick={buscarEstudiante}
                    disabled={
                      buscarEstudianteMutation.isPending || estudianteIdInput.trim() === ""
                    }
                  >
                    <SearchIcon />
                    Buscar
                  </Button>
                ) : (
                  <Button variant="outline" onClick={cambiarDeEstudiante}>
                    Cambiar
                  </Button>
                )}
              </div>
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

            {estudiante && (
              <div className="flex items-center gap-2 rounded-lg border border-input p-3">
                <UserRoundIcon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{estudiante.username}</p>
                  <p className="text-xs text-muted-foreground">{estudiante.carreraNombre}</p>
                </div>
              </div>
            )}
          </FieldGroup>

          {/* --- Seccion: Seleccion (aparece recien con estudiante identificado) --- */}
          {estudiante && (
            <FieldGroup>
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
                    <p className="text-xs font-medium text-muted-foreground">Año {anio}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {materias.map((materia) => (
                        <button
                          key={materia.id}
                          type="button"
                          onClick={() => elegirMateria(materia)}
                          className="rounded-lg border border-input p-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5 data-selected:border-primary data-selected:bg-primary/5"
                          data-selected={materiaSeleccionada?.id === materia.id || undefined}
                        >
                          {materia.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </FieldGroup>
          )}

          {/* --- Seccion: Evaluacion + Inscripcion/Deseleccion (aparece recien
              con una materia elegida) --- */}
          {materiaSeleccionada && (
            <FieldGroup>
              <div>
                <h3 className="text-sm font-medium">{materiaSeleccionada.nombre}</h3>
                <p className="text-xs text-muted-foreground">
                  Año {materiaSeleccionada.anio}
                </p>
              </div>

              {clasesQuery.isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner /> Buscando clases disponibles…
                </div>
              )}

              {clasesQuery.data?.length === 0 && (
                <Alert>
                  <TriangleAlertIcon />
                  <AlertTitle>Todavía no hay clases para esta materia</AlertTitle>
                  <AlertDescription>Elegí otra materia o volvé más tarde.</AlertDescription>
                </Alert>
              )}

              {clasesQuery.data?.map((clase) => (
                <div
                  key={clase.id}
                  className="flex items-center justify-between rounded-lg border border-input p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{clase.profesor.nombre}</p>
                    <Badge variant={clase.cuposDisponibles > 0 ? "secondary" : "destructive"}>
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

              <Button variant="outline" onClick={deseleccionar} className="w-fit">
                Volver a elegir materia
              </Button>
            </FieldGroup>
          )}

          {/* --- Seccion: Confirmacion (aparece recien con la Matricula creada) --- */}
          {matriculaCreada && (
            <FieldGroup>
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

              <Button onClick={inscribirOtraMateria} className="w-fit">
                Inscribir otra materia
              </Button>
            </FieldGroup>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

import type {
  CarreraDTO,
  ClaseDTO,
  EstudianteDTO,
  MateriaDTO,
  MatriculaDTO,
  MatriculaRequestDTO,
} from "./types";

// Ruta relativa: en `npm run dev` la resuelve el proxy de vite.config.ts hacia GlassFish;
// en produccion, el frontend vive dentro del mismo WAR, asi que resuelve al mismo origen.
const API_BASE = "/SistemaMatriculas/api";

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body === "object" && body !== null) {
      return Object.values(body).join(", ");
    }
  } catch {
    // el body no era JSON valido, se usa el mensaje generico de abajo
  }
  return `${response.status} ${response.statusText}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(await parseErrorBody(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// --- Carreras (solo lectura, dato estatico) ---

export function fetchCarreras(): Promise<CarreraDTO[]> {
  return request<CarreraDTO[]>("/carreras");
}

// --- Estudiante (identificacion, sin login -- ver FormularioPagoPage.tsx) ---

export function fetchEstudiante(id: number): Promise<EstudianteDTO> {
  return request<EstudianteDTO>(`/estudiantes/${id}`);
}

// --- Materias (plan de estudio de una carrera) ---

export function fetchMateriasPorCarrera(carreraId: number): Promise<MateriaDTO[]> {
  return request<MateriaDTO[]>(`/materias?carreraId=${carreraId}`);
}

// --- Clases (ofertas concretas de una materia, con profesor y cupos) ---

export function fetchClasesPorMateria(materiaId: number): Promise<ClaseDTO[]> {
  return request<ClaseDTO[]>(`/clases?materiaId=${materiaId}`);
}

// --- Matricula (el paso de inscripcion en si) ---

export function crearMatricula(matricula: MatriculaRequestDTO): Promise<MatriculaDTO> {
  return request<MatriculaDTO>("/matriculas", {
    method: "POST",
    body: JSON.stringify(matricula),
  });
}

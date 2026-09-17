# Bitácora — Frontend de inscripción (Opciones 2 y 3)

Registro cronológico de cómo se construyó la pantalla de inscripción a materias,
en el orden real en que se hizo — no es un resumen final prolijo, es el paso a
paso, incluyendo los puntos donde hizo falta agregar algo al backend que no
existía. Mismo espíritu que `Documentation/bitacora-fixes.md` de
HelloJakarta-variante.

Punto de partida: `frontend/` era una copia literal del frontend de
HelloJakarta-variante (Productos/Facturas/SesionCaja/Usuarios), sin adaptar a
este dominio (Carreras/Materias/Profesores/Clases/Matrículas).

---

## 1. Diagnóstico inicial — nada del frontend copiado servía tal cual

Se leyó `frontend/src/api/client.ts` y `api/types.ts` tal como habían quedado
de la copia. Confirmado:

- `client.ts` línea 5: `API_BASE = "/HelloJakarta-variante/api"` — apuntaba al
  context root equivocado. El real es `/SistemaMatriculas` (viene de
  `<finalName>` en `back/pom.xml`, ver sección 2 de este documento).
- `types.ts` tenía `ProductoDTO`/`FacturaDTO`/`SesionCajaDTO`/`UsuarioDTO` —
  ninguno existe en este backend.
- Todo `components/` y varias `routes/` eran del dominio del e-shop.

No se tocó nada todavía en este paso — solo diagnóstico.

## 2. De dónde sale cada pieza de la URL real

Antes de tocar código, se confirmó con el backend real (no se asumió nada):

- `SistemaMatriculas` (context root) → `back/pom.xml`, `<finalName>`.
- `/api` (prefijo JAX-RS) → `back/.../rest/ApplicationConfig.java`,
  `@ApplicationPath(ApplicationConfig.Endpoints.API)`.
- `/carreras`, `/materias`, etc. → cada `@Path(Endpoints.X)` de los
  Controllers, usando las constantes de `ApplicationConfig.Endpoints`.

Concatenado: `http://localhost:8080/SistemaMatriculas/api/...` — confirmado
con `curl` contra el backend ya desplegado.

## 3. Login (necesario antes que nada, para otra parte del frontend)

Se agregó `POST /estudiantes/login` (backend) porque no existía ningún
endpoint de autenticación. No es parte del flujo de inscripción en sí, pero
quedó documentado acá porque en el camino se corrigieron dos bugs reales en
`EstudianteServiceImpl` que afectan a *toda* la entidad Estudiante, incluida
la inscripción:

- `crear()`/`login()` usaban `findAll()` + filtro en memoria (traía toda la
  tabla). Se agregó `findByUsername(String)` a `EstudianteRepository` —
  primer método de Jakarta Data derivado por nombre usado en este proyecto
  (confirmado que el proveedor, EclipseLink 5.0.1 sobre GlassFish 8, lo
  soporta, con un deploy real).
- `crear()` armaba la `Carrera` del estudiante con un stub por id (solo
  `id`, sin `nombre`) — la respuesta del `POST /estudiantes` salía sin
  `carreraNombre`, y un `carreraId` inventado tiraba un 500 crudo en vez de
  un 409 limpio. Se corrigió trayendo la `Carrera` real antes de insertar.

## 4. Filtro nuevo: `GET /clases?materiaId=` (backend)

Al diseñar el paso "Evaluación" (mostrar las clases de una materia elegida,
con su profesor y cupos), se encontró que `ClaseController` solo tenía
`listar()` (todas) y `buscarPorId()` — no había forma de pedir "las clases de
ESTA materia". Se agregó, mismo patrón que ya usaba `MateriaController` con
`?carreraId=`:

- `ClaseService.java` línea 14-15 — `listarPorMateria(Long materiaId)`.
- `ClaseServiceImpl.java` — implementación (filtra `claseRepository.findAll()`
  por `materia.id`, reutiliza `toDtoConCupos()` que ya existía).
- `ClaseController.java` — `@QueryParam("materiaId")` en `listar()`.

Verificado con `curl` antes de tocar el frontend:
`GET /clases?materiaId=1` → devuelve solo la clase de esa materia, con
`cuposDisponibles` correcto.

## 5. `types.ts` — DTOs que faltaban (líneas 63-77)

`api/types.ts` ya tenía `CarreraDTO`, `MateriaDTO`, `ProfesorDTO`,
`ClaseDTO`, `EstudianteDTO`/`EstudianteRequestDTO` (armados en mensajes
anteriores de esta misma sesión). Faltaba solo:

- Líneas 63-77: `EstadoMatricula`, `MatriculaDTO`, `MatriculaRequestDTO` —
  el único par que quedaba pendiente (marcado con un comentario
  `//MatriculaDto (+ sus *RequestDto)` que ya estaba ahí de antes).

## 6. `client.ts` — reescrito completo (71 líneas)

El archivo original (copiado de HelloJakarta-variante) ya no compilaba:
importaba `ProductoDTO`/`FacturaDTO`/`SesionCajaDTO`/`UsuarioDTO`, que ya no
existen en `types.ts` (fueron comentados/borrados en un paso anterior de esta
sesión). Se reescribió completo:

- Líneas 1-32: `API_BASE` corregido a `/SistemaMatriculas/api`, y se
  mantuvieron intactos `parseErrorBody()`/`request<T>()` (el mecanismo real
  de `fetch()`, sin cambios de lógica).
- Líneas 34-71: 5 funciones nuevas, una por necesidad concreta del flujo de
  inscripción:
  - `fetchCarreras()` — no se usa todavía en ninguna pantalla, se dejó lista
    para cuando haga falta un selector de carrera en otro lado.
  - `fetchEstudiante(id)` — paso Identificación.
  - `fetchMateriasPorCarrera(carreraId)` — paso Selección.
  - `fetchClasesPorMateria(materiaId)` — paso Evaluación (depende del
    endpoint nuevo del punto 4).
  - `crearMatricula(dto)` — paso Inscripción.

## 7. Bug real encontrado y corregido: `basepath`/`base` apuntaban al otro proyecto

Al revisar `router.tsx` para conectar la navegación, se encontró que
`basepath: "/HelloJakarta-variante"` (línea 94 original) seguía sin
adaptar — cualquier `<Link>` habría armado una URL rota. Mismo bug en
`vite.config.ts` (`base` y `server.proxy`). Los tres se corrigieron a
`/SistemaMatriculas`. No relacionado directamente con la inscripción, pero
sin este fix ningún link de la app hubiera funcionado nunca.

## 8. Primera versión de la página — sin carrusel (después descartada)

Primer intento de `FormularioPagoPage.tsx`: un componente simple con
`useState<Paso>` y renderizado condicional por `if (paso === "...")`, sin
reusar el carrusel que tenía la página original. Compilaba limpio, pero no
era lo pedido — la instrucción explícita era usar la página de pago original
**como base** precisamente porque tenía un carrusel, no reemplazarlo por otra
estructura. Se descartó y se rehizo (punto 9).

## 9. `FormularioPagoPage.tsx` definitivo — con carrusel (536 líneas)

Reescrito reusando la estructura real de la página original
(`Carousel`/`CarouselContent`/`CarouselItem` de shadcn sobre Embla, el
indicador de pasos con `maxStep`/`maxStepRef`, el fix de race-condition con
refs que ya estaba documentado en el archivo original). Lo que cambia
respecto al original: el avance de paso ya no lo dispara un `setTimeout`
("autoavance" cuando un campo queda válido) sino el `onSuccess` de una
mutation real contra el backend — no tiene sentido "esperar a que el usuario
deje de escribir" cuando lo que se espera es la respuesta HTTP.

Las 4 etapas, cada una en su propio `CarouselItem`:

1. **Identificación** — sin login (pedido explícito). Input numérico de id +
   botón "Buscar" → `fetchEstudiante`. Se documentó en el código por qué no
   hay un selector por nombre: necesitaría un endpoint `GET /estudiantes`
   (listar todos) que hoy no existe — ver sección 11.
2. **Selección** — plan de estudio (`fetchMateriasPorCarrera`) agrupado por
   año (1 a 5), usando el `carreraId` del estudiante ya identificado.
3. **Evaluación** — clases de la materia elegida (`fetchClasesPorMateria`),
   con el nombre del profesor y `cuposDisponibles`; botón deshabilitado si no
   hay cupo.
4. **Confirmación** — resultado real de `crearMatricula` (la `Matricula`
   creada, con `estado`, `fechaInscripcion`, etc.).

**Comentarios de TanStack Query, explicados a fondo en el código** (pedido
explícito, no solo qué hace cada línea sino por qué):

- `materiasQuery` — `staleTime: 5 * 60 * 1000` (5 min). Justificación en el
  código: `Materia` es dato estático (sembrado una vez, sin endpoint de
  escritura), no tiene sentido re-pedirlo seguido.
- `clasesQuery` — `staleTime: 10 * 1000` (10 seg). Mucho más corto que el de
  arriba porque `cuposDisponibles` cambia cada vez que CUALQUIER estudiante
  se matricula, no solo el que está usando la pantalla.
- `matricularMutation.onSuccess` — llama
  `queryClient.invalidateQueries({ queryKey: ["clases", materiaSeleccionada?.id] })`:
  en cuanto se confirma una inscripción, se sabe con certeza que el cupo de
  esa clase bajó, así que se invalida la cache YA en vez de esperar los 10s
  de `staleTime`.
- `buscarEstudianteMutation`/`matricularMutation` son `useMutation`, no
  `useQuery`, aunque el primero técnicamente sea una lectura (`GET`) —
  comentado en el código el motivo: solo debe dispararse por un click
  explícito ("Buscar"), nunca solo, a diferencia de los datos que la pantalla
  necesita tener listos apenas se llega al paso.

## 10. `FormularioLargoPage.tsx` — mismo trámite, sin carrusel (363 líneas)

Pedido explícito: "espejo del formulario del carrusel pero sin carrusel".
Mismos estados, mismas queries/mutations, mismas llamadas al backend —
la única diferencia real es de presentación: en vez de `CarouselItem`s que
se ven de a uno (con `api.scrollTo()` para pasar de uno a otro), acá cada
sección es un `<div>` normal que aparece en el flujo del documento (con
`&&` condicional) apenas la etapa anterior está resuelta — sin indicador de
pasos, sin bloqueo por swipe/teclado (no hace falta, no hay gesto que pueda
saltarse nada si no hay Carousel).

## 11. Gaps que quedaron documentados, no implementados

Dejados fuera a propósito, mencionados en comentarios del código para que no
se pierdan:

- **`GET /estudiantes` (listar todos)** — no existe. Por eso Identificación
  es "por id numérico" y no un selector con nombre. Si se agrega, ahí sí
  tendría sentido cambiar el input por un `<select>`.
- **Ocultar materias ya cursadas/en curso** — `GET /materias?carreraId=`
  devuelve TODAS las materias de la carrera, sin importar el historial del
  estudiante que pregunta. Necesitaría un endpoint nuevo consciente del
  estudiante (ej. `GET /clases?materiaId=X&estudianteId=Y` o similar).
- **Cancelar una inscripción ya confirmada** — sigue sin existir (distinto de
  "Deseleccionar", que en este flujo nunca llega a crear una `Matricula` en
  primer lugar, así que no hay nada que cancelar del lado del servidor).
- **Límite de 3 materias `EN_CURSO` por estudiante** — regla de negocio
  pendiente, no se agregó todavía en `MatriculaServiceImpl.matricular()`.

## 12. Limpieza final — páginas del e-shop eliminadas

Por indicación explícita ("ya está en git, no hay problema"), se eliminaron
del árbol de trabajo (recuperables desde el historial de git si hiciera
falta):

- `routes/ProductosPage.tsx`, `FacturasPage.tsx`, `SesionCajaPage.tsx`,
  `UsuariosPage.tsx`.
- `components/ProductosPanel.tsx`, `ProductosTable.tsx`, `ProductoForm.tsx`,
  `FacturasTable.tsx`, `SesionCajaPanel.tsx`, `SesionCajaTable.tsx`,
  `SesionCajaForm.tsx`, `UsuariosPanel.tsx`, `UsuariosTable.tsx`,
  `UsuarioForm.tsx`.
- `react-table.d.ts` (augmentación de tipos de `@tanstack/react-table`, solo
  la usaban las tablas de arriba).
- `router.tsx` — sacadas las 4 rutas correspondientes.
- `RootLayout.tsx` — `<h1>` corregido de "HelloJakarta" a
  "Sistema de Matrículas".

Verificado con `npx tsc --noEmit` (cero errores en todo el proyecto) y
`npm run build` (build real de Vite, sin fallar) antes de dar esto por
cerrado.

## 13. Verificación final end-to-end

```bash
cd back && mvn clean package        # incluye el build de Vite (webapp/ generado)
asadmin deploy --force=true target/SistemaMatriculas.war
curl http://localhost:8080/SistemaMatriculas/            # 200
curl http://localhost:8080/SistemaMatriculas/api/carreras # 200
```

App real, desplegada, front y back en el mismo WAR — mismo patrón monolítico
que HelloJakarta-variante.

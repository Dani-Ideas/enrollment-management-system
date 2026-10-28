# Mejoras "nivel senior" del backend

Plan para llevar `back/` a un nivel senior. Cada etapa es **un commit**: se implementa, se
compila y se prueba (`mvn clean install` + deploy), y solo entonces se pasa a la siguiente.
Van en este orden porque varias etapas tocan los mismos archivos; hacerlas todas juntas
impediria separarlas en commits limpios.

Antes de la etapa 1 ya quedaron hechos (commit "Hot fix: id existente..."):

- 404 con `RecursoNoEncontradoException` en lugar de devolver `null`.
- PUT de inscripcion: `formacionesComplementarias: null` = no tocar; el front carga las
  existentes con `GET /inscripciones/{id}/formaciones-complementarias`.
- 422 con `ReferenciaInvalidaException` para ids inexistentes en el body (antes 409).

| Etapa | Tema | Estado |
|---|---|---|
| 1 | Limpieza: comentarios que mienten y codigo muerto | Hecha (commit b6882f6) |
| 2 | Paquetes y nombres | Hecha |
| 3 | Resolucion de FKs consistente en los mappers | Hecha |
| 4 | Errores y API REST (Problem Details, 201, logging) | Hecha |
| 5 | Pruebas unitarias | Hecha |
| 6a | N+1: JOIN FETCH en listados | Hecha |
| 6b | Sufijo `Id` en los request DTO | Pendiente |
| 6 | Resto de decisiones de arquitectura | Documentadas |

---

## Etapa 1 — Limpieza: comentarios que mienten y codigo muerto

**Por que:** un comentario desactualizado es peor que no tener comentario: el siguiente
desarrollador le cree. Un comentario explica **por que** existe el codigo; la historia
("antes se llamaba...", "se borro...") vive en git y en `DOCUMENTATION/`.

**Cambios:**

- `InscripcionMapper`: se borran `toEntityConFormaciones()` y `mapFormaciones()` (nadie los
  llamaba) y el comentario "dice que no puede encotrar el atributo".
- `InscripcionEty.formacionesComplementarias`: se quita `cascade = PERSIST`. El service
  inserta los hijos a mano con `insertAll()`, la cascada no se usaba y su comentario hablaba
  de metodos que ya no existen.
- Comentarios corregidos o reducidos a lo que sigue siendo cierto: `InscripcionEty`,
  `FormacionComplementariaEty`, `FormacionComplementariaMapper`, `RequestResponseMapper`
  (lista de implementadores vieja), `InscripcionService` (hablaba de filtros que `listar()`
  no tiene), `ReglaDeNegocioException` y su mapper (profesores/cupos de otro dominio),
  `ApplicationConfig` (dominio academico ya eliminado), `ServiceArtifaxImpl`, entidades y
  controllers `MiniForm*` (historia de renombres).
- Controllers de catalogo solo-GET: se quita `@Consumes`, que no aplica a un GET sin body.
- `InscripcionServiceImpl`: `.collect(Collectors.toList())` → `.toList()` (Java 16+).
- `persistence.xml`: esquema y `version` 3.0 → 3.2 (lo que GlassFish 8 / Jakarta EE 11
  implementa) y comentario sin la referencia a un "resumen final" inexistente.

**Commit:**

```bash
git add -- back/src/main/java back/src/main/resources
git commit -m "Limpieza: comentarios desactualizados y codigo muerto en el back

- Borra InscripcionMapper.toEntityConFormaciones()/mapFormaciones(), sin uso.
- Quita cascade=PERSIST de InscripcionEty: los hijos se insertan con insertAll().
- Corrige comentarios que describian metodos, endpoints o dominios que ya no existen.
- Quita @Consumes de los controllers solo-GET y usa Stream.toList().
- persistence.xml a la version 3.2 del esquema."
```

**Verificar:** `mvn clean install`, deploy, crear y actualizar una inscripcion con
formaciones (el comportamiento no debe cambiar).

**Para entender en que se basa:**

- Jeff Atwood, *Code Tells You How, Comments Tell You Why*: por que un comentario debe
  explicar la intencion y no repetir el codigo. https://blog.codinghorror.com/code-tells-you-how-comments-tell-you-why/
- Stack Overflow Blog, *Best practices for writing code comments*: 9 reglas concretas (no
  duplicar el codigo, no dejar comentarios desactualizados, etc.). https://stackoverflow.blog/2021/12/23/best-practices-for-writing-code-comments/
- Refactoring Guru, *Comments* (code smell): cuando un comentario es sintoma de un problema. https://refactoring.guru/smells/comments
- Refactoring Guru, *Dead Code*: por que el codigo sin uso se borra en vez de dejarlo "por si acaso". https://refactoring.guru/smells/dead-code
- Martin Fowler, *CodeSmell*: que es un "olor" de codigo y por que no siempre es un bug. https://martinfowler.com/bliki/CodeSmell.html

---

## Etapa 2 — Paquetes y nombres

**Por que:** un nombre debe decir que hace la clase sin abrirla. Hoy `lib/` mezcla
repositorios con interfaces de service, el paquete de entidades se llama `model` en
`estaticos` y `dinamica` en `dinamicas`, y `ServiceArtifax` no dice nada.

**Cambios:**

| Antes | Despues |
|---|---|
| `estaticos/lib/*Repository` | `estaticos/repository/` |
| `estaticos/lib/*Service`, `ServiceArtifax` | `estaticos/service/` |
| `ServiceArtifax` / `ServiceArtifaxImpl` | `CatalogoInscripcionCache` / `CatalogoInscripcionCacheImpl` |
| `dinamicas/dinamica/` | `dinamicas/model/` |
| `dinamicas/lib/*Repository` | `dinamicas/repository/` |
| `dinamicas/lib/*Service` | `dinamicas/service/` |

- `back/pom.xml`: actualizar `packagingExcludes` del WAR con los paquetes nuevos (los
  `includes` del jar `ejb` ya usan `estaticos/**` y `dinamicas/**`, no cambian).
- El contrato de la API no cambia (mismos paths y JSON).

**Commit:** `git add -A -- back` y
`"Paquetes por rol: repository/service/model y CatalogoInscripcionCache"`.

**Verificar:** el deploy no debe dar `ClassNotFoundException` (si da, falta un paquete en
`packagingExcludes`) y `GET /api/endpoints` lista lo mismo que antes.

**Para entender en que se basa:**

- Martin Fowler, *TwoHardThings*: por que nombrar bien es uno de los problemas dificiles. https://martinfowler.com/bliki/TwoHardThings.html
- Oracle, *Java Naming Conventions*: convenciones oficiales de paquetes y clases. https://www.oracle.com/java/technologies/javase/codeconventions-namingconventions.html
- Martin Fowler, *Repository* (PoEAA): el rol que justifica un paquete `repository/` propio. https://martinfowler.com/eaaCatalog/repository.html
- Martin Fowler, *Service Layer* (PoEAA): el rol que justifica un paquete `service/` aparte. https://martinfowler.com/eaaCatalog/serviceLayer.html

---

## Etapa 3 — Resolucion de FKs consistente en los mappers

**Por que:** hoy hay dos estrategias para convertir un id en entidad. Los mappers `MiniForm*`
buscan en la BD y lanzan `ReferenciaInvalidaException` si no existe; los geograficos y
`PersonaMapper` devuelven un "stub" con solo el id, que EclipseLink no garantiza persistir
bien. Una sola estrategia = un solo comportamiento ante un id invalido (422).

**Cambios:**

- `PaisMapper`, `EstadoMapper`, `MunicipioMapper`, `ColoniaMapper`, `TipoDireccionMapper` y
  `PersonaMapper` pasan de `interface` a `abstract class implements RequestResponseMapper`,
  con su repositorio inyectado y `desdeId()` igual al de `MiniFormEstMapper`.
- `FormacionComplementariaRequestDto`: se quita `inscripcionId`. El servidor siempre lo
  pisaba con la inscripcion real, asi que en el contrato solo confundia. El mapper ignora
  `inscripcion` y el service la asigna (como ya hacia).
- Front: `FormacionComplementariaRequestDTO` en `api/types.ts` y `useInscripcionForm.ts`
  dejan de mandar `inscripcionId`.

**Commit:** `git add -A -- back/src/main/java frontend/src` y
`"Mappers: desdeId() valida contra la BD en todos; sin inscripcionId en el request"`.

**Verificar:** POST de inscripcion con un `estado` inexistente → 422; crear y actualizar
formaciones sigue funcionando.

**Para entender en que se basa:**

- Jim Shore, *Fail Fast* (IEEE Software): validar el id en cuanto entra, no dejar que falle
  despues en la base con un error confuso. https://martinfowler.com/ieeeSoftware/failFast.pdf
- Vlad Mihalcea, *find vs getReference*: la diferencia entre cargar la entidad real y usar
  una referencia "stub" con solo el id. https://vladmihalcea.com/entitymanager-find-getreference-jpa/
- Baeldung, *Quick Guide to MapStruct*: mappers con `uses`, clases abstractas e inyeccion. https://www.baeldung.com/mapstruct
- Martin Fowler, *Data Transfer Object* y *LocalDTO*: que debe y que no debe viajar en un
  DTO (por que se quito `inscripcionId` del request). https://martinfowler.com/eaaCatalog/dataTransferObject.html · https://martinfowler.com/bliki/LocalDTO.html

---

## Etapa 4 — Errores y API REST

**Por que:** un cliente debe poder tratar todos los errores igual. Hoy hay dos formatos
(`{"error": ...}` y el mapa de campos), una excepcion no controlada sale como el HTML de
GlassFish, y no hay ni un log.

**Cambios:**

- **Problem Details (RFC 9457):** un record `general/ProblemDetails`
  (`title`, `status`, `detail`, `instance`, `errores`) con `Content-Type:
  application/problem+json` en todos los `ExceptionMapper`.
- **`ExcepcionNoControladaMapper` (`ExceptionMapper<Throwable>`):** registra el error con
  `System.Logger` y responde un 500 limpio sin stack trace. Las `WebApplicationException`
  (404 de ruta, 405...) pasan con su respuesta original.
- **`@NotNull` en `@QueryParam`** (`paisId`, `estadoId`, `municipioId`, `personaId`): se
  borran los `if (x == null) return 400` de los controllers; el `ValidationExceptionMapper`
  responde el 400 y usa solo el nombre del parametro en `errores`.
- **POST `/inscripciones` → 201 Created** con header `Location: /api/inscripciones/{id}`.
- **Logging:** `CatalogoInscripcionCacheImpl` registra cuantas filas cargo de cada catalogo
  (un catalogo vacio al arrancar deja de ser silencioso).
- Front: `mensajeDeError()` en `api/client.ts` lee `detail` (y `errores`) del Problem Details.

**Commit:** `git add -A -- back/src/main/java frontend/src` y
`"Errores con Problem Details (RFC 9457), 500 controlado con log, 201 en POST"`.

**Verificar:**

```bash
curl -i http://localhost:8080/SistemaMatriculas/api/inscripciones/9999                          # 404 problem+json
curl -i http://localhost:8080/SistemaMatriculas/api/catalogos-geograficos/estados               # 400 con errores.paisId
curl -i http://localhost:8080/SistemaMatriculas/api/no-existe                                   # 404, no 500
```

y en el front, que un error de guardado siga mostrando un toast legible.

**Para entender en que se basa:**

- RFC 9457, *Problem Details for HTTP APIs*: el estandar del cuerpo de error (secciones 3 y 3.1). https://www.rfc-editor.org/rfc/rfc9457
- Zalando, *RESTful API Guidelines*: guia de API de una empresa grande; ver las reglas de
  Problem JSON, codigos de estado y `Location` en el POST. https://opensource.zalando.com/restful-api-guidelines/
- MDN, *422 Unprocessable Content*, *409 Conflict* y *201 Created*: cuando usar cada uno. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422 · https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409 · https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201
- OWASP, *Error Handling Cheat Sheet*: por que un 500 no debe mostrar el stack trace al cliente. https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
- OWASP, *Logging Cheat Sheet*: que registrar, con que nivel y que no registrar nunca. https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Jersey, *Representations and Responses* (seccion *Exception Mapping*): como Jersey elige
  el `ExceptionMapper` mas cercano al tipo de la excepcion. https://eclipse-ee4j.github.io/jersey.github.io/documentation/latest/representations.html
- Hibernate Validator, *Declaring and validating method constraints*: `@NotNull` sobre
  parametros de metodo (la base del `@NotNull` en `@QueryParam`). https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/

---

## Etapa 5 — Pruebas unitarias

**Por que:** es lo que mas falta. Sin pruebas, cada refactor se valida a mano desplegando.
`sincronizarFormacionesComplementarias()` es el candidato perfecto: tiene tres caminos
(borrar, actualizar, crear) y ya tuvo un bug que borraba datos.

**Cambios:**

- `back/pom.xml`: `junit-jupiter`, `mockito-junit-jupiter` (scope `test`) y
  `maven-surefire-plugin` con version fija.
- `back/src/test/java/.../InscripcionServiceImplTest`: con repositorios y mappers simulados
  (Mockito), cubre: id inexistente → 404, PUT con lista `null` no toca formaciones, PUT con
  lista vacia las borra todas, una con id se actualiza, una sin id se crea, id de formacion
  ajeno → 422.
- Las pruebas corren solas en `mvn clean install`; si una falla, el build falla.

**Commit:** `git add -A -- back/pom.xml back/src/test` y
`"Pruebas unitarias de InscripcionServiceImpl (JUnit 5 + Mockito)"`.

**Verificar:** `mvn clean install` muestra `Tests run: N, Failures: 0`.

**Para entender en que se basa:**

- Ham Vocke (en el sitio de Fowler), *The Practical Test Pyramid*: que es una prueba
  unitaria, de integracion y end-to-end, y cuantas de cada una. https://martinfowler.com/articles/practical-test-pyramid.html
- Martin Fowler, *TestPyramid*: la idea en una pagina. https://martinfowler.com/bliki/TestPyramid.html
- Martin Fowler, *Mocks Aren't Stubs*: que es un mock, un stub y cuando conviene cada uno. https://martinfowler.com/articles/mocksArentStubs.html
- Baeldung, *Mockito and JUnit 5 – Using ExtendWith*: el mismo setup de `InscripcionServiceImplTest`. https://www.baeldung.com/mockito-junit-5-extension

---

## Etapa 6 — Decisiones de arquitectura (no se implementan sin acordarlas)

Cada una cambia el contrato con el front, la base o la estructura del equipo, asi que se
discuten antes. Quedan aqui con su justificacion.

1. **N+1 (hecho en 6a: `JOIN FETCH` en `InscripcionRepository.listarConCatalogos()` y `DireccionRepository.porPersona()`).** `GET /inscripciones` recorre 6 `@ManyToOne` LAZY
   por fila, y cada direccion recorre colonia → municipio → estado → pais. Con
   `eclipselink.logging.level=FINE` (ya activo) se cuentan los SELECT de un GET. Si son
   muchos: `@Query` con `JOIN FETCH` (verificar que el Jakarta Data de GlassFish lo acepte)
   o tomar los textos de los catalogos del cache en memoria.
2. **Paginacion.** `findAll()` sin limite. Jakarta Data trae `PageRequest`/`Page`, pero el
   front hoy filtra del lado del cliente sobre la lista completa: cambiarlo es un cambio de
   contrato.
3. **Migraciones de esquema: descartado.** En este equipo el esquema lo administra
   GlassFish/EclipseLink (`create-or-extend-tables`), no se usa Flyway.
4. **Package-by-feature (monolito modular).** Agrupar por funcionalidad
   (`catalogo/inscripcion`, `catalogo/geografico`, `persona`, `inscripcion`) en vez de por
   volatilidad (`estaticos`/`dinamicas`). Mantiene la regla de dependencias acicilicas.
   No se recomienda Hexagonal/Clean: para un CRUD de este tamano agrega capas sin aportar.
5. **Ids con sufijo en los request DTO** (`estado` → `estadoId`). Hoy `estado` es un id en
   `InscripcionRequestDto` y un texto en `InscripcionDto`. El front quito el sufijo a
   proposito en su momento, asi que se decide en conjunto.
6. **EJB `@Stateless` vs CDI + `@Transactional`.** Lo moderno es CDI; el jar `ejb` puede
   contener beans CDI igual. No cambia nada visible, es una decision de estandar del equipo.

**Para entender en que se basa:**

- N+1 y `JOIN FETCH`:
  - Vlad Mihalcea, *N+1 query problem*: que es, como detectarlo en el log y como resolverlo. https://vladmihalcea.com/n-plus-1-query-problem/
  - Thorben Janssen, *JOIN vs LEFT JOIN vs JOIN FETCH*: que hace cada uno en JPQL. https://thorben-janssen.com/hibernate-tips-difference-join-left-join-fetch-join/
  - Baeldung, *Eager/Lazy Loading*: por que un `@ManyToOne` LAZY dispara consultas al recorrerlo. https://www.baeldung.com/hibernate-lazy-eager-loading
  - Baeldung, *JPA Entity Graph*: la alternativa estandar a `JOIN FETCH`. https://www.baeldung.com/jpa-entity-graph
- Paginacion: Zalando, *RESTful API Guidelines*, seccion *Pagination* (offset vs cursor). https://opensource.zalando.com/restful-api-guidelines/
- Package-by-feature:
  - Philipp Hauer, *Package by Feature*: comparacion directa contra package-by-layer. https://phauer.com/2020/package-by-feature/
  - Robert C. Martin, *Screaming Architecture*: la estructura debe "gritar" el dominio, no el framework. https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html
  - Martin Fowler, *MonolithFirst*: por que un monolito bien modularizado es el punto de partida sano. https://martinfowler.com/bliki/MonolithFirst.html
- Nombres de campos en el JSON: Zalando, *RESTful API Guidelines*, seccion *JSON guidelines*. https://opensource.zalando.com/restful-api-guidelines/
- EJB vs CDI: Jakarta EE Tutorial, *Introduction to CDI*. https://jakarta.ee/learn/docs/jakartaee-tutorial/current/cdi/cdi-basic/cdi-basic.html

---

## Patrones que hay que saber nombrar y defender

| Patron | Donde esta |
|---|---|
| Repository | `*Repository` (Jakarta Data) |
| Service Layer | `*ServiceImpl` |
| DTO | records `*Dto` / `*RequestDto` |
| Data Mapper / Assembler | MapStruct + `RequestResponseMapper` |
| Dependency Injection / IoC | CDI `@Inject` |
| Cache read-through | `CatalogoInscripcionCacheImpl` |
| Exception Translation | `ExceptionMapper` |
| Unit of Work | `EntityManager` + JTA |
| Registry | `ApplicationConfig.REGISTRO_ACTIVO` |

Ademas: SOLID (sobre todo responsabilidad unica e inversion de dependencias) y dependencias
aciclicas entre paquetes (`dinamicas` → `estaticos` → `comun`, nunca al reves).

## Documentacion

- Patrones (Repository, Service Layer, DTO, Data Mapper, Unit of Work): https://martinfowler.com/eaaCatalog/
- Capas: https://martinfowler.com/bliki/PresentationDomainDataLayering.html
- Codigos HTTP (201, 400, 404, 409, 422): https://www.rfc-editor.org/rfc/rfc9110#section-15
- Problem Details: https://www.rfc-editor.org/rfc/rfc9457
- Jakarta REST 4.0 (Providers, Exceptions): https://jakarta.ee/specifications/restful-ws/4.0/jakarta-restful-ws-spec-4.0.html
- Jakarta Validation 3.1 (method constraints): https://jakarta.ee/specifications/bean-validation/3.1/jakarta-validation-spec-3.1.html
- Jakarta Data 1.0 (paginacion, `@Query`): https://jakarta.ee/specifications/data/1.0/jakarta-data-1.0.html
- Jakarta Persistence 3.2 (`JOIN FETCH`, entity graphs): https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html
- Jakarta Transactions 2.0 (`@Transactional`): https://jakarta.ee/specifications/transactions/2.0/jakarta-transactions-spec-2.0.html
- MapStruct (mappers abstractos, "Invoking other mappers"): https://mapstruct.org/documentation/stable/reference/html/
- N+1 (articulo): https://vladmihalcea.com/n-plus-1-query-problem/
- JUnit 5: https://junit.org/junit5/docs/current/user-guide/ · Mockito: https://site.mockito.org/
- `System.Logger`: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.Logger.html

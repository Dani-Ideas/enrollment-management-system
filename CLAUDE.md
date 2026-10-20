# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Code comments, identifiers and docs are in Spanish; keep new code consistent with that. Many comments reference a sibling project, `HelloJakarta-variante`, whose patterns this one copies.

## Layout

Monolith: a Jakarta EE 11 WAR (`back/`) that also serves a React SPA (`frontend/`). The Vite build writes straight into `back/src/main/webapp` (`emptyOutDir: true`), so files there are generated and get overwritten — never edit them by hand. `DOCUMENTATION/` holds a Spanish dev log (`bitacora-*.md`) of past decisions.

## Commands

Backend (Java 21, Maven, deployed to GlassFish 8, H2 datasource `jdbc/matriculasDS` that must exist in GlassFish):

```bash
cd back && mvn clean package                                 # -> target/SistemaMatriculas.war
asadmin deploy --force=true target/SistemaMatriculas.war
curl http://localhost:8080/SistemaMatriculas/api/endpoints   # lists the active endpoints
```

The `frontend-maven-plugin` block in `back/pom.xml` is commented out, so `mvn package` does **not** build the frontend. Run `npm run build` in `frontend/` before packaging if the UI changed.

Frontend (`frontend/`):

```bash
npm run dev       # Vite on :5173, proxies /SistemaMatriculas/api -> localhost:8080 (GlassFish must be running)
npm run build     # tsc -b && vite build -> ../back/src/main/webapp
npm run lint      # oxlint
npx tsc --noEmit  # type-check only
```

There are no automated tests on either side. Changes are checked with `curl` against a deployed WAR and with `tsc`/`vite build`.

## Context root

The app lives under `/SistemaMatriculas` (from `<finalName>` in `pom.xml`). That prefix is hardcoded in four places that must stay in sync: `vite.config.ts` (`base` and `server.proxy`), `router.tsx` (`basepath`), and `api/client.ts` (`API_BASE = "/SistemaMatriculas/api"`).

## Backend architecture (`back/src/main/java/org/example`)

The backend's design pattern is **Repository**. Data access goes through per-entity Jakarta Data repositories (`lib/XRepository`) or the generic `EntityManager`-based `ServiceRead`/`ServiceCreateModify`. Services and controllers never write JPQL or SQL of their own.

Packages: `rest` (JAX-RS controllers), `lib` (service interfaces, Jakarta Data repositories, exceptions), `ejb` (EJB implementations and seeders), `mapper` (MapStruct), `dto` (Java records), `model` (JPA entities), `builder`.

**Endpoint registration is explicit.** `rest/ApplicationConfig` extends Jersey `ResourceConfig`. A controller is exposed only if it is in the `REGISTRO_ACTIVO` map. A `@Path` annotation alone does nothing. The same map feeds `GET /api/endpoints`. Path strings are constants in `ApplicationConfig.Endpoints`, which controllers import statically.

**Two domains share one WAR and database:**
- *Academic* (Carrera, Materia, Profesor, Clase, Estudiante, Matricula): the code exists and is seeded by `DatosIniciales`, but it is **not registered** right now. To reactivate it, add its controllers to `REGISTRO_ACTIVO`. Don't delete those `Endpoints` constants: the unregistered controllers still import them.
- *Inscripción* (the active one): `InscripcionEty` holds 6 FKs to catalogs (`MiniFormEst/Sis/Resp/Amb` — Estado, Sistema, Responsable ×3 roles, Ambiente) and a 1:N list of `FormacionComplementariaEty`. It is seeded by `DatosInicialesInscripcion`.

**Generic service trio (Inscripción domain):**
- `ServiceRead` (`@Singleton`) and `ServiceCreateModify` (`@Stateless`): generic `Class<T>` read and write through the `EntityManager`. They work on entities only, with no DTOs.
- `ServiceArtifaxImpl` (`@Singleton @Startup @DependsOn("DatosInicialesInscripcion")`) is an **in-memory read cache**. It preloads the 4 catalogs as DTOs, plus `InscripcionEty` and `FormacionComplementariaEty` as raw entities so it can filter by FK ids. It serves `GET /inscripciones?estadoId&sistemaId&ambienteId` and `/catalogos-inscripcion`. It never writes to the DB.
- `InscripcionServiceImpl` owns writes for Inscripción and FormacionComplementaria. **After every DB write it must call `serviceArtifax.refrescarInscripcion` / `refrescarFormacionComplementaria` / `removerFormacionComplementaria`**, or the cache goes stale. Keep this rule for any new write path.

**Mapping conventions:**
- Mappers use CDI (`componentModel = CDI`, injected with `@Inject`) and usually extend `RequestResponseMapper<Entity, RequestDto, Dto>`. Request DTOs carry FK ids. Response DTOs are flattened to display text (e.g. `estado.estado`, `jefeCarrera.nombreLargo`), so ids are *not* in the response.
- Catalog mappers expose `desdeId(Long)`, which builds stub entities holding only the id. The service then replaces the stubs with real entities loaded from the repositories. This validates that the ids exist and gives the flattened `toDto` real data to read.
- PUT uses `actualizarDesde(@MappingTarget …)` with `@InheritConfiguration(name = "toEntity")`. Composite create (Inscripción + formaciones in one POST) uses `@AfterMapping` to build the children.
- When MapStruct can't express cross-entity business rules, a hand-written `builder/` class is used (Clase, Matricula).
- If you touch `maven-compiler-plugin`: the processor order is Lombok, then MapStruct, then `lombok-mapstruct-binding`. All three must be listed, or Lombok silently stops running.

**Errors:** throw `lib/ReglaDeNegocioException` for business-rule violations. `ReglaDeNegocioExceptionMapper` turns it into a 409 carrying the message, and `ValidationExceptionMapper` handles Bean Validation (`@Valid`) failures.

**Persistence:** EclipseLink with `create-or-extend-tables` (the schema is generated from the entities). All entities use `GenerationType.SEQUENCE`. `ServiceRead.getList` builds JPQL from `getSimpleName()`, so don't set a custom `@Entity(name=…)`. Repositories are Jakarta Data interfaces in `lib/` (derived queries such as `findByUsername` work).

## Frontend architecture (`frontend/src`)

React 19 + TypeScript, TanStack Router (code-based routes in `router.tsx`), TanStack Query, TanStack Form, Tailwind v4, and shadcn/ui (`components/ui`, `@/` alias → `src`).

- `api/client.ts`: a single axios client. All API paths are constants at the top of this file. Every call goes through one `request()` helper. `api/types.ts` mirrors the backend DTOs by hand, so update it when a DTO changes.
- The inscripción form lives in `components/inscripcion-form/`: field components plus the `useInscripcionForm` hook. It is consumed by `InscripcionWizard.tsx` and the pages in `routes/pago/`.
- `*.tanstack.tsx` files are parallel variants of the same pages and components built on TanStack Form. They are not wired into `router.tsx`. When changing wizard or form behavior, ask whether the `.tanstack` variants should get the same change.
- Pages are carousel-based multi-step flows (Embla via shadcn `Carousel`). Steps advance on mutation `onSuccess`, not on timers.

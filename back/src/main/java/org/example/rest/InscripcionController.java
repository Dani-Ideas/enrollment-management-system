package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.example.dto.InscripcionCompuestaDto;
import org.example.dto.InscripcionCompuestaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.dto.InscripcionRequestDto;
import org.example.lib.ServiceArtifax;
import org.example.lib.CatalogosInscripcionService;
import org.example.lib.InscripcionService;

import java.net.URI;

import static org.example.rest.ApplicationConfig.Endpoints.INSCRIPCIONES;

// Endpoint principal del dominio solicitud/inscripcion -- GET lista, GET por id, POST
// (crear), PUT (actualizar).
//
// buscar()/actualizar() SIGUEN en InscripcionService (sin migrar al trio generico -- ese
// service resuelve 6 relaciones con reglas de negocio, migrarlo es aparte de lo que se
// pidio aqui). listar() SI se movio a ServiceArtifax, porque el filtro por
// estado/sistema/ambiente necesita la "mini base de datos" en memoria (ver
// ServiceArtifax.listarInscripciones()) -- filtrar contra el Repository/BD en cada
// llamada hubiera sido un query nuevo por combinacion de filtros, en vez de un
// stream().filter() sobre lo que ya esta cargado.
//
// crear() recibe InscripcionCompuestaRequestDto (Inscripcion + N formaciones complementarias
// opcionales) y delega a CatalogosInscripcionService -- UNA sola peticion HTTP, en vez de
// que el cliente cree la Inscripcion, espere el id, y despues mande un POST por cada
// formacion complementaria como antes.
@Path(INSCRIPCIONES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InscripcionController {

    @EJB
    private InscripcionService inscripcionService;

    @EJB
    private CatalogosInscripcionService catalogosInscripcionService;

    @EJB
    private ServiceArtifax serviceArtifax;

    @Context
    private UriInfo uriInfo;

    // Los 3 @QueryParam son opcionales -- omitir uno (o los tres) es "no filtrar por ese
    // campo", igual que ANTES devolvia todo. Ej: GET /inscripciones?estadoId=1&ambienteId=3
    @GET
    public Response listar(
            @QueryParam("estadoId") Long estadoId,
            @QueryParam("sistemaId") Long sistemaId,
            @QueryParam("ambienteId") Long ambienteId
    ) {
        return Response.ok(serviceArtifax.listarInscripciones(estadoId, sistemaId, ambienteId)).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        InscripcionDto dto = inscripcionService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @POST
    public Response crear(@Valid InscripcionCompuestaRequestDto dto) {
        InscripcionCompuestaDto creada = catalogosInscripcionService.crearInscripcionConFormaciones(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creada.inscripcion().id())).build();
        return Response.created(location).entity(creada).build();
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionRequestDto dto) {
        InscripcionDto actualizada = inscripcionService.actualizar(id, dto);
        if (actualizada == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(actualizada).build();
    }
}

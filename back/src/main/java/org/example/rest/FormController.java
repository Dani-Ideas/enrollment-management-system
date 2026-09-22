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
import org.example.dto.FormDto;
import org.example.dto.FormRequestDto;
import org.example.ejb.ServiceArtifax;
import org.example.lib.FormService;

import java.net.URI;

import static org.example.rest.ApplicationConfig.Endpoints.IMPLANTACIONES;

// Endpoint principal del dominio solicitud/implantacion -- GET lista, GET por id, POST
// (crear), PUT (actualizar). El path sigue siendo "/implantaciones" (Endpoints.IMPLANTACIONES)
// a proposito -- el rename de tabla/clase (SOL_N_IMPLANTACION/Implantacion -> FORM/Form) no
// cambia el contrato de la API, el frontend sigue funcionando sin tocarlo.
//
// crear()/buscar()/actualizar() SIGUEN en FormService (sin migrar al trio generico -- ese
// service resuelve 6 relaciones con reglas de negocio, migrarlo es aparte de lo que se
// pidio aqui). listar() SI se movio a ServiceArtifax, porque el filtro por
// estado/sistema/ambiente necesita la "mini base de datos" en memoria (ver
// ServiceArtifax.listarImplantaciones()) -- filtrar contra el Repository/BD en cada
// llamada hubiera sido un query nuevo por combinacion de filtros, en vez de un
// stream().filter() sobre lo que ya esta cargado.
@Path(IMPLANTACIONES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FormController {

    @EJB
    private FormService formService;

    @EJB
    private ServiceArtifax serviceArtifax;

    @Context
    private UriInfo uriInfo;

    // Los 3 @QueryParam son opcionales -- omitir uno (o los tres) es "no filtrar por ese
    // campo", igual que ANTES devolvia todo. Ej: GET /implantaciones?estadoId=1&ambienteId=3
    @GET
    public Response listar(
            @QueryParam("estadoId") Long estadoId,
            @QueryParam("sistemaId") Long sistemaId,
            @QueryParam("ambienteId") Long ambienteId
    ) {
        return Response.ok(serviceArtifax.listarImplantaciones(estadoId, sistemaId, ambienteId)).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        FormDto dto = formService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @POST
    public Response crear(@Valid FormRequestDto dto) {
        FormDto creada = formService.crear(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creada.id())).build();
        return Response.created(location).entity(creada).build();
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid FormRequestDto dto) {
        FormDto actualizada = formService.actualizar(id, dto);
        if (actualizada == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(actualizada).build();
    }
}

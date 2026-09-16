package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.example.dto.ClaseDto;
import org.example.dto.ClaseRequestDto;
import org.example.lib.ClaseService;

import java.net.URI;

// GET es de consulta (ver cupos disponibles antes de matricularse). POST es "administrativo"
// (asignar profesor a materia) -- ReglaDeNegocioException (habilitacion/limite de 3) se
// traduce a 409 sola, via ReglaDeNegocioExceptionMapper.
@Path("/clases")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClaseController {

    @EJB
    private ClaseService claseService;

    @Context
    private UriInfo uriInfo;

    @GET
    public Response listar() {
        return Response.ok(claseService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        var dto = claseService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @POST
    public Response crear(@Valid ClaseRequestDto dto) {
        ClaseDto creada = claseService.crear(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creada.id())).build();
        return Response.created(location).entity(creada).build();
    }
}

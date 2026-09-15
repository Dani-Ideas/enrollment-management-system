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
import org.example.dto.EstudianteDto;
import org.example.dto.EstudianteRequestDto;
import org.example.lib.EstudianteService;

import java.net.URI;

// POST /estudiantes = registro de cuenta (username/password/carrera). El "historial de
// cursos completados" vive en /estudiantes/{id}/historial, no en el propio EstudianteDto.
@Path("/estudiantes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstudianteController {

    @EJB
    private EstudianteService estudianteService;

    @Context
    private UriInfo uriInfo;

    @POST
    public Response crear(@Valid EstudianteRequestDto dto) {
        EstudianteDto creado = estudianteService.crear(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creado.id())).build();
        return Response.created(location).entity(creado).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        var dto = estudianteService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @GET
    @Path("/{id}/historial")
    public Response historial(@PathParam("id") Long id) {
        return Response.ok(estudianteService.historial(id)).build();
    }
}

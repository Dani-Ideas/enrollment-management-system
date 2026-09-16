package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.example.dto.MatriculaDto;
import org.example.dto.MatriculaRequestDto;
import org.example.lib.MatriculaService;

import java.net.URI;

import static org.example.rest.ApplicationConfig.Endpoints.MATRICULAS;

// El endpoint central del sistema: POST /matriculas es "el estudiante se matricula en una
// clase" -- las 3 reglas (misma carrera, cupo maximo 3, sin duplicados) se validan en
// MatriculaServiceImpl y llegan aca como 409 via ReglaDeNegocioExceptionMapper, este
// Controller no sabe nada de esas reglas.
@Path(MATRICULAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MatriculaController {

    @EJB
    private MatriculaService matriculaService;

    @Context
    private UriInfo uriInfo;

    @GET
    public Response listarPorClase(@QueryParam("claseId") Long claseId) {
        if (claseId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Falta el query param claseId")
                    .build();
        }
        return Response.ok(matriculaService.listarPorClase(claseId)).build();
    }

    @POST
    public Response matricular(@Valid MatriculaRequestDto dto) {
        MatriculaDto creada = matriculaService.matricular(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creada.id())).build();
        return Response.created(location).entity(creada).build();
    }

    @PATCH
    @Path("/{id}/completar")
    public Response completar(@PathParam("id") Long id) {
        MatriculaDto actualizada = matriculaService.completar(id);
        if (actualizada == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(actualizada).build();
    }
}

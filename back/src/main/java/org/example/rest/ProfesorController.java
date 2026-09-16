package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.ProfesorService;

import static org.example.rest.ApplicationConfig.Endpoints.PROFESORES;

// Solo lectura -- incluye las habilitaciones de cada profesor (que materias PODRIA dictar,
// no las que dicta ahora -- ver ClaseController para eso).
@Path(PROFESORES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProfesorController {

    @EJB
    private ProfesorService profesorService;

    @GET
    public Response listar() {
        return Response.ok(profesorService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        var dto = profesorService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }
}

package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.MateriaService;

// Solo lectura. GET /materias?carreraId=X devuelve el plan de estudio completo de esa
// carrera (25 materias, 5 por anio) -- sin filtro, devuelve todas.
@Path("/materias")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MateriaController {

    @EJB
    private MateriaService materiaService;

    @GET
    public Response listar(@QueryParam("carreraId") Long carreraId) {
        if (carreraId != null) {
            return Response.ok(materiaService.listarPorCarrera(carreraId)).build();
        }
        return Response.ok(materiaService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        var dto = materiaService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }
}

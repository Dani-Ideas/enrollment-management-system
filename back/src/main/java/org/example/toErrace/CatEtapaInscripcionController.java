package org.example.toErrace;

import jakarta.ejb.EJB;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/cat-etapas-inscripcion")
@Produces(MediaType.APPLICATION_JSON)
public class CatEtapaInscripcionController {

    @EJB
    private CatEtapaInscripcionService catEtapaInscripcionService;

    @GET
    public Response listar() {
        return Response.ok(catEtapaInscripcionService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Integer id) {
        CatEtapaInscripcionDto dto = catEtapaInscripcionService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }
}

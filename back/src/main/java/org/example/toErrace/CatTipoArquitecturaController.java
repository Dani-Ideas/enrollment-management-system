package org.example.toErrace;

import jakarta.ejb.EJB;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/cat-tipos-arquitectura")
@Produces(MediaType.APPLICATION_JSON)
public class CatTipoArquitecturaController {

    @EJB
    private CatTipoArquitecturaService catTipoArquitecturaService;

    @GET
    public Response listar() {
        return Response.ok(catTipoArquitecturaService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Integer id) {
        CatTipoArquitecturaDto dto = catTipoArquitecturaService.buscarPorId(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }
}

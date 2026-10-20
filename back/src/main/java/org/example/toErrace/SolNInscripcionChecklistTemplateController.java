package org.example.toErrace;

import jakarta.ejb.EJB;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/inscripcion-checklist-templates")
@Produces(MediaType.APPLICATION_JSON)
public class SolNInscripcionChecklistTemplateController {

    @EJB
    private SolNInscripcionChecklistTemplateService solNInscripcionChecklistTemplateService;

    @GET
    public Response listar() {
        return Response.ok(solNInscripcionChecklistTemplateService.listar()).build();
    }

    @GET
    @Path("/{idTipoArquitectura}/{nombre}/{orden}")
    public Response buscar(@PathParam("idTipoArquitectura") Integer idTipoArquitectura,
                           @PathParam("nombre") String nombre,
                           @PathParam("orden") Integer orden) {
        SolNInscripcionChecklistTemplateDto dto = solNInscripcionChecklistTemplateService.buscarPorId(idTipoArquitectura, nombre, orden);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }
}

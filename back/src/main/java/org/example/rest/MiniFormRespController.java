package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.MiniFormRespService;

import static org.example.rest.ApplicationConfig.Endpoints.RESPONSABLES;

// Solo lectura -- catalogo del dominio solicitud/implantacion. El path sigue siendo
// "/responsables" (Endpoints.RESPONSABLES) -- el rename no cambia el contrato de la API.
@Path(RESPONSABLES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormRespController {

    @EJB
    private MiniFormRespService miniFormRespService;

    @GET
    public Response listar() {
        return Response.ok(miniFormRespService.listar()).build();
    }
}

package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.MiniFormSisService;

import static org.example.rest.ApplicationConfig.Endpoints.SISTEMAS;

// Solo lectura -- catalogo del dominio solicitud/implantacion. El path sigue siendo
// "/sistemas" (Endpoints.SISTEMAS) -- el rename no cambia el contrato de la API.
@Path(SISTEMAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormSisController {

    @EJB
    private MiniFormSisService miniFormSisService;

    @GET
    public Response listar() {
        return Response.ok(miniFormSisService.listar()).build();
    }
}

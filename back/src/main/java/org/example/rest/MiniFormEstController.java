package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.MiniFormEstService;

import static org.example.rest.ApplicationConfig.Endpoints.ESTADOS;

// Solo lectura -- catalogo del dominio solicitud/implantacion. El path sigue siendo
// "/estados" (Endpoints.ESTADOS) a proposito -- el rename de tabla/clase no cambia el
// contrato de la API, el frontend sigue funcionando sin tocarlo.
@Path(ESTADOS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormEstController {

    @EJB
    private MiniFormEstService miniFormEstService;

    @GET
    public Response listar() {
        return Response.ok(miniFormEstService.listar()).build();
    }
}

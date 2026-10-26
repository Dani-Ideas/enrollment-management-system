package org.example.estaticos.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.estaticos.lib.ServiceArtifax;

import static org.example.general.ApplicationConfig.Endpoints.ESTADOS;

// Solo lectura -- catalogo del dominio solicitud/inscripcion. El path sigue siendo
// "/estados" (Endpoints.ESTADOS) a proposito -- el rename de tabla/clase no cambia el
// contrato de la API, el frontend sigue funcionando sin tocarlo.
@RequestScoped
@Path(ESTADOS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormEstController {
    @Inject
    private ServiceArtifax serviceArtifax;

    @GET
    public Response listar() {
        return Response.ok(serviceArtifax.listarEstados()).build();
    }
}

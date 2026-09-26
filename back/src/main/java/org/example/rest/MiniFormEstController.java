package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.ServiceArtifax;

import static org.example.rest.ApplicationConfig.Endpoints.ESTADOS;

// Solo lectura -- catalogo del dominio solicitud/inscripcion. El path sigue siendo
// "/estados" (Endpoints.ESTADOS) a proposito -- el rename de tabla/clase no cambia el
// contrato de la API, el frontend sigue funcionando sin tocarlo.
//
// Migrado al trio generico (ServiceRead/ServiceCreateModify/ServiceArtifax) -- ya NO usa
// MiniFormEstService (borrado). ServiceArtifax es el reemplazo: misma forma publica
// (listarEstados), este Controller no cambio de comportamiento, solo de a quien le
// pregunta.
@Path(ESTADOS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormEstController {

    @EJB
    private ServiceArtifax serviceArtifax;

    @GET
    public Response listar() {
        return Response.ok(serviceArtifax.listarEstados()).build();
    }
}

package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.ServiceArtifax;

import static org.example.rest.ApplicationConfig.Endpoints.SISTEMAS;

// Solo lectura -- catalogo del dominio solicitud/inscripcion. El path sigue siendo
// "/sistemas" (Endpoints.SISTEMAS) -- el rename no cambia el contrato de la API.
//
// Migrado al trio generico -- ya NO usa MiniFormSisService (borrado), ahora ServiceArtifax.
@Path(SISTEMAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormSisController {

    @EJB
    private ServiceArtifax serviceArtifax;

    @GET
    public Response listar() {
        return Response.ok(serviceArtifax.listarSistemas()).build();
    }
}

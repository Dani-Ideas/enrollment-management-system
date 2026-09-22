package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.ejb.ServiceArtifax;

import static org.example.rest.ApplicationConfig.Endpoints.AMBIENTES;

// Solo lectura -- catalogo del dominio solicitud/implantacion. El path sigue siendo
// "/ambientes" (Endpoints.AMBIENTES) -- el rename no cambia el contrato de la API.
//
// Migrado al trio generico -- ya NO usa MiniFormAmbService (borrado), ahora ServiceArtifax.
@Path(AMBIENTES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormAmbController {

    @EJB
    private ServiceArtifax serviceArtifax;

    @GET
    public Response listar() {
        return Response.ok(serviceArtifax.listarAmbientes()).build();
    }
}

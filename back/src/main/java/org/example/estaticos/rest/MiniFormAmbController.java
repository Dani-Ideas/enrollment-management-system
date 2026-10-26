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

import static org.example.general.ApplicationConfig.Endpoints.AMBIENTES;

// Solo lectura -- catalogo del dominio solicitud/inscripcion. El path sigue siendo
// "/ambientes" (Endpoints.AMBIENTES) -- el rename no cambia el contrato de la API.
//
// Migrado al trio generico -- ya NO usa MiniFormAmbService (borrado), ahora ServiceArtifax.
@RequestScoped
@Path(AMBIENTES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiniFormAmbController {

    @Inject
    private ServiceArtifax serviceArtifax;

    @GET
    public Response listar() {
        return Response.ok(serviceArtifax.listarAmbientes()).build();
    }
}

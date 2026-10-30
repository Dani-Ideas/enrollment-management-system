package org.example.estaticos.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.estaticos.service.CatalogoInscripcionCache;

import static org.example.general.ApplicationConfig.Endpoints.ESTADOS;

// Solo lectura: se sirve desde el cache en memoria (CatalogoInscripcionCache).
@RequestScoped
@Path(ESTADOS)
@Produces(MediaType.APPLICATION_JSON)
public class MiniFormEstController {
    @Inject
    private CatalogoInscripcionCache catalogoInscripcionCache;

    @GET
    public Response listar() {
        return Response.ok(catalogoInscripcionCache.listarEstados()).build();
    }
}

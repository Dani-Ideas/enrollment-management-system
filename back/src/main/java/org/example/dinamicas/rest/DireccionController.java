package org.example.dinamicas.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.dinamicas.lib.DireccionService;

import static org.example.general.ApplicationConfig.Endpoints.DIRECCIONES;

// Solo lectura por ahora. personaId es obligatorio (400 si falta).
@RequestScoped
@Path(DIRECCIONES)
@Produces(MediaType.APPLICATION_JSON)
public class DireccionController {

    @Inject
    private DireccionService direccionService;

    @GET
    public Response listar(@QueryParam("personaId") Long personaId) {
        if (personaId == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return Response.ok(direccionService.listarPorPersona(personaId)).build();
    }
}

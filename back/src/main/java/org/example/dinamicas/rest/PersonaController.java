package org.example.dinamicas.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.dinamicas.lib.PersonaService;

import static org.example.general.ApplicationConfig.Endpoints.PERSONAS;

// Solo lectura por ahora. La liga Persona <-> Inscripcion queda pendiente.
@RequestScoped
@Path(PERSONAS)
@Produces(MediaType.APPLICATION_JSON)
public class PersonaController {

    @Inject
    private PersonaService personaService;

    @GET
    public Response listar() {
        return Response.ok(personaService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        return Response.ok(personaService.buscarPorId(id)).build();
    }
}

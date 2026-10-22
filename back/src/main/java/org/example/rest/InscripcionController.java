package org.example.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.dto.InscripcionConFormacionComplementariaDto;
import org.example.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dto.InscripcionDto;
import org.example.lib.InscripcionService;

import static org.example.rest.ApplicationConfig.Endpoints.INSCRIPCIONES;

@RequestScoped
@Path(INSCRIPCIONES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InscripcionController {

    @Inject
    private InscripcionService inscripcionService;

    @GET
    public Response listar() {
        return Response.ok(inscripcionService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        return Response.ok(inscripcionService.buscarPorId(id)).build();
    }

    @POST
    public Response crear(@Valid InscripcionConFormacionComplementariaRequestDto dto) {
        return Response.ok(inscripcionService.crear(dto)).build();
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionConFormacionComplementariaRequestDto dto) {
        return Response.ok(inscripcionService.actualizar(id, dto)).build();
    }
}

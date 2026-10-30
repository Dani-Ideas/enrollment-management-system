package org.example.dinamicas.rest;

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
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dinamicas.service.InscripcionService;

import java.net.URI;

import static org.example.general.ApplicationConfig.Endpoints.FORMACIONES_COMPLEMENTARIAS;
import static org.example.general.ApplicationConfig.Endpoints.INSCRIPCIONES;

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

    @GET
    @Path("/{id}" + FORMACIONES_COMPLEMENTARIAS)
    public Response listarFormaciones(@PathParam("id") Long id) {
        return Response.ok(inscripcionService.listarFormaciones(id)).build();
    }

    @POST
    // 201 Created + Location hacia la inscripcion nueva (RFC 9110 §15.3.2).
    public Response crear(@Valid InscripcionConFormacionComplementariaRequestDto dto, @Context UriInfo uriInfo) {
        InscripcionConFormacionComplementariaDto creada = inscripcionService.crear(dto);
        URI ubicacion = uriInfo.getAbsolutePathBuilder()
                .path(String.valueOf(creada.inscripcion().id()))
                .build();
        return Response.created(ubicacion).entity(creada).build();
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionConFormacionComplementariaRequestDto dto) {
        return Response.ok(inscripcionService.actualizar(id, dto)).build();
    }
}

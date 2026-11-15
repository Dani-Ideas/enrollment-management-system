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
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaDto;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaRequestDto;
import org.example.dinamicas.service.InscripcionSecundariaService;
import org.example.general.RespuestasRest;

import static org.example.general.ApplicationConfig.Endpoints.INSCRIPCIONES_SECUNDARIA;

@RequestScoped
@Path(INSCRIPCIONES_SECUNDARIA)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InscripcionSecundariaController {

    @Inject
    private InscripcionSecundariaService inscripcionSecundariaService;

    @GET
    public Response listar() {
        return Response.ok(inscripcionSecundariaService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        return Response.ok(inscripcionSecundariaService.buscarConDiploma(id)).build();
    }

    @POST
    public Response crear(@Valid InscripcionSecundariaConDiplomaRequestDto dto, @Context UriInfo uriInfo) {
        InscripcionSecundariaConDiplomaDto creada = inscripcionSecundariaService.crear(dto);
        return RespuestasRest.creado(uriInfo, creada.inscripcionSecundaria().id(), creada);
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionSecundariaConDiplomaRequestDto dto) {
        return Response.ok(inscripcionSecundariaService.actualizar(id, dto)).build();
    }
}

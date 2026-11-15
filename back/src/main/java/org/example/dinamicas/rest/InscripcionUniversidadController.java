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
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.service.InscripcionUniversidadService;
import org.example.general.RespuestasRest;

import static org.example.general.ApplicationConfig.Endpoints.INSCRIPCIONES_UNIVERSIDAD;

@RequestScoped
@Path(INSCRIPCIONES_UNIVERSIDAD)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InscripcionUniversidadController {

    @Inject
    private InscripcionUniversidadService inscripcionUniversidadService;

    @GET
    public Response listar() {
        return Response.ok(inscripcionUniversidadService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response buscar(@PathParam("id") Long id) {
        return Response.ok(inscripcionUniversidadService.buscarConDiploma(id)).build();
    }

    @POST
    public Response crear(@Valid InscripcionUniversidadConDiplomaRequestDto dto, @Context UriInfo uriInfo) {
        InscripcionUniversidadConDiplomaDto creada = inscripcionUniversidadService.crear(dto);
        return RespuestasRest.creado(uriInfo, creada.inscripcionUniversidad().id(), creada);
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionUniversidadConDiplomaRequestDto dto) {
        return Response.ok(inscripcionUniversidadService.actualizar(id, dto)).build();
    }
}

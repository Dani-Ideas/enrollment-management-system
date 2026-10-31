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
import org.example.general.RespuestasRest;

import static org.example.general.ApplicationConfig.Endpoints.FORMACIONES_COMPLEMENTARIAS;
import static org.example.general.ApplicationConfig.Endpoints.INSCRIPCIONES;

@RequestScoped
@Path(INSCRIPCIONES)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InscripcionController {
    //Inject region
    @Inject
    private InscripcionService inscripcionService;
    //endregion
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
    public Response crear(@Valid InscripcionConFormacionComplementariaRequestDto dto, @Context UriInfo uriInfo) {
        InscripcionConFormacionComplementariaDto creada = inscripcionService.crear(dto);
        return RespuestasRest.creado(uriInfo, creada.inscripcion().id(), creada);
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid InscripcionConFormacionComplementariaRequestDto dto) {
        return Response.ok(inscripcionService.actualizar(id, dto)).build();
    }
}

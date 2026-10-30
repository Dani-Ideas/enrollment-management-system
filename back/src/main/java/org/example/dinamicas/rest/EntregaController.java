package org.example.dinamicas.rest;

import jakarta.data.repository.Param;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.dinamicas.dto.EntregaRequestDto;
import org.example.dinamicas.service.EntregaService;

import static org.example.general.ApplicationConfig.Endpoints.ENTREGAS;

// Solo listar + crear: la PK es compuesta (direccion + diploma), igual que DireccionController
// evita un GET/{id} por el mismo motivo (una PK compuesta no es un solo path segment limpio).
@RequestScoped
@Path(ENTREGAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EntregaController {

    @Inject
    private EntregaService entregaService;

    @GET
    public Response listar() {
        return Response.ok(entregaService.listar()).build();
    }

    @GET
    @Path("/{id}")
    public Response porID(@PathParam("id") Long id) {return Response.ok(entregaService.listarPorId(id)).build();}


    @POST
    public Response crear(@Valid EntregaRequestDto dto) {
        return Response.status(Response.Status.CREATED).entity(entregaService.crear(dto)).build();
    }
}

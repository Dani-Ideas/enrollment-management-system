package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.ejb.ServiceArtifax;

import java.net.URI;

import static org.example.rest.ApplicationConfig.Endpoints.FORMACIONES_COMPLEMENTARIAS;

// "Formaciones complementarias" ligadas 1:N a una Inscripcion por FK (idInscripcion).
// Endpoint propio, separado de /inscripciones a proposito -- no vienen embebidas en
// FormDto ni en listarInscripciones(), el front las pide aparte (GET ?inscripcionId=X)
// solo cuando hace falta (crear/editar una Inscripcion, o abrir "Ver detalle" en la lista).
@Path(FORMACIONES_COMPLEMENTARIAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FormacionComplementariaController {

    @EJB
    private ServiceArtifax serviceArtifax;

    @Context
    private UriInfo uriInfo;

    // inscripcionId es requerido en la practica (el front siempre lo manda), pero se deja
    // opcional a nivel HTTP -- omitirlo devuelve TODAS las formaciones, mismo criterio que
    // listarInscripciones() en FormController.
    @GET
    public Response listar(@QueryParam("inscripcionId") Long inscripcionId) {
        return Response.ok(serviceArtifax.listarFormacionesComplementariasPorInscripcion(inscripcionId)).build();
    }

    @POST
    public Response crear(@Valid FormacionComplementariaRequestDto dto) {
        FormacionComplementariaDto creado = serviceArtifax.crearFormacionComplementaria(dto);
        URI location = uriInfo.getAbsolutePathBuilder().path(String.valueOf(creado.id())).build();
        return Response.created(location).entity(creado).build();
    }

    @PUT
    @Path("/{id}")
    public Response actualizar(@PathParam("id") Long id, @Valid FormacionComplementariaRequestDto dto) {
        FormacionComplementariaDto actualizado = serviceArtifax.actualizarFormacionComplementaria(id, dto);
        if (actualizado == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(actualizado).build();
    }

    @DELETE
    @Path("/{id}")
    public Response eliminar(@PathParam("id") Long id) {
        boolean eliminado = serviceArtifax.eliminarFormacionComplementaria(id);
        if (!eliminado) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}

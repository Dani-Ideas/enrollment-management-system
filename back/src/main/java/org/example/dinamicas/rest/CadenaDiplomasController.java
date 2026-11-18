package org.example.dinamicas.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.dinamicas.dto.CadenaDiplomasRequestDto;
import org.example.dinamicas.service.CadenaDiplomasService;

import static org.example.general.ApplicationConfig.Endpoints.CADENA_DIPLOMAS;

// Ni GET ni es un recurso que se liste despues -- POST es la accion "crear la cadena desde
// cero" (rechaza con 409 si un nivel ya existe, ver CadenaDiplomasServiceImpl.crear), PUT es
// "guardar la cadena" en modo upsert (actualiza lo que ya existe, crea lo que no -- usada
// por "actualizar", que puede estar retomando una cadena a medio llenar de una sesion
// anterior). 200 (no 201): no hay un unico recurso nuevo con una unica URL propia que
// devolver via Location -- el body ya trae todo lo que se creo/actualizo.
@RequestScoped
@Path(CADENA_DIPLOMAS)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CadenaDiplomasController {

    @Inject
    private CadenaDiplomasService cadenaDiplomasService;

    @POST
    public Response crear(@PathParam("id") Long id, @Valid CadenaDiplomasRequestDto dto) {
        return Response.ok(cadenaDiplomasService.crear(id, dto)).build();
    }

    @PUT
    public Response actualizar(@PathParam("id") Long id, @Valid CadenaDiplomasRequestDto dto) {
        return Response.ok(cadenaDiplomasService.actualizar(id, dto)).build();
    }
}

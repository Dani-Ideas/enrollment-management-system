package org.example.rest;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.lib.ReglaDeNegocioException;

import java.util.Map;

// Traduce cualquier ReglaDeNegocioException (cupo excedido, profesor no habilitado, limite
// de 3 clases, username duplicado, etc.) a 409 con el mensaje real -- ningun Controller
// necesita try/catch, la excepcion escapa hasta aca sola.
@Provider
public class ReglaDeNegocioExceptionMapper implements ExceptionMapper<ReglaDeNegocioException> {

    @Override
    public Response toResponse(ReglaDeNegocioException exception) {
        return Response.status(Response.Status.CONFLICT)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("error", exception.getMessage()))
                .build();
    }
}

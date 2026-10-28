package org.example.general;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.comun.RecursoNoEncontradoException;

import java.util.Map;

@Provider
public class RecursoNoEncontradoExceptionMapper implements ExceptionMapper<RecursoNoEncontradoException> {

    @Override
    public Response toResponse(RecursoNoEncontradoException exception) {
        return Response.status(Response.Status.NOT_FOUND)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("error", exception.getMessage()))
                .build();
    }
}

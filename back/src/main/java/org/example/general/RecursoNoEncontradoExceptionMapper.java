package org.example.general;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.comun.RecursoNoEncontradoException;

@Provider
public class RecursoNoEncontradoExceptionMapper implements ExceptionMapper<RecursoNoEncontradoException> {

    @Context
    private UriInfo uriInfo;

    @Override
    public Response toResponse(RecursoNoEncontradoException exception) {
        return ProblemDetails.respuesta(Response.Status.NOT_FOUND, exception.getMessage(), uriInfo);
    }
}

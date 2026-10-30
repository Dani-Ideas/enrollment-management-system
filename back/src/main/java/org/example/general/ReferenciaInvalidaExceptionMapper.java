package org.example.general;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.comun.ReferenciaInvalidaException;

@Provider
public class ReferenciaInvalidaExceptionMapper implements ExceptionMapper<ReferenciaInvalidaException> {

    @Context
    private UriInfo uriInfo;

    @Override
    public Response toResponse(ReferenciaInvalidaException exception) {
        return ProblemDetails.respuesta(ProblemDetails.UNPROCESSABLE_CONTENT, exception.getMessage(), uriInfo);
    }
}

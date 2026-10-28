package org.example.general;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.comun.ReglaDeNegocioException;

// ReglaDeNegocioException -> 409 con el mensaje real. Ningun Controller necesita try/catch:
// la excepcion escapa hasta aca sola.
@Provider
public class ReglaDeNegocioExceptionMapper implements ExceptionMapper<ReglaDeNegocioException> {

    @Context
    private UriInfo uriInfo;

    @Override
    public Response toResponse(ReglaDeNegocioException exception) {
        return ProblemDetails.respuesta(Response.Status.CONFLICT, exception.getMessage(), uriInfo);
    }
}

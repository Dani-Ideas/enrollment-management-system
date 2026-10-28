package org.example.general;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.example.comun.ReferenciaInvalidaException;

import java.util.Map;

// 422 Unprocessable Content (RFC 9110 §15.5.21) -- Response.Status no trae constante para 422.
@Provider
public class ReferenciaInvalidaExceptionMapper implements ExceptionMapper<ReferenciaInvalidaException> {

    private static final int UNPROCESSABLE_CONTENT = 422;

    @Override
    public Response toResponse(ReferenciaInvalidaException exception) {
        return Response.status(UNPROCESSABLE_CONTENT)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of("error", exception.getMessage()))
                .build();
    }
}

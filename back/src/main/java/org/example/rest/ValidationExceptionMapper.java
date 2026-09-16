package org.example.rest;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.LinkedHashMap;
import java.util.Map;

// 400 con un error por campo, en vez del 500 crudo que tira Bean Validation por default.
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        Map<String, String> errores = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(v ->
                errores.put(v.getPropertyPath().toString(), v.getMessage()));
        return Response.status(Response.Status.BAD_REQUEST)
                .type(MediaType.APPLICATION_JSON)
                .entity(errores)
                .build();
    }
}

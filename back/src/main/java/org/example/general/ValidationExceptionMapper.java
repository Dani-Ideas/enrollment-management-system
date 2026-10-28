package org.example.general;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ElementKind;
import jakarta.validation.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// 400 con un error por campo (en "errores"), en vez del 500 crudo que tira Bean Validation
// por default. Cubre @Valid en el body y @NotNull en @QueryParam.
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Context
    private UriInfo uriInfo;

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        Map<String, String> errores = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(v -> errores.put(campo(v), v.getMessage()));
        return ProblemDetails.respuesta(Response.Status.BAD_REQUEST,
                "La peticion tiene campos invalidos.", errores, uriInfo);
    }

    // El property path de Bean Validation es [metodo, parametro, propiedad...] (ej.
    // "crear.dto.inscripcion.proyecto"). Al cliente solo le sirve lo que el reconoce: la
    // ruta dentro del body ("inscripcion.proyecto") o el nombre del @QueryParam ("paisId").
    private static String campo(ConstraintViolation<?> violacion) {
        List<String> partes = new ArrayList<>();
        for (Path.Node nodo : violacion.getPropertyPath()) {
            if (nodo.getKind() != ElementKind.METHOD) {
                partes.add(nodo.toString());
            }
        }
        if (partes.size() > 1) {
            partes.remove(0);
        }
        return partes.stream().collect(Collectors.joining("."));
    }
}

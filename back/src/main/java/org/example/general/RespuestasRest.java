package org.example.general;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.net.URI;

// Construye el Response de un POST que crea un recurso -- un solo lugar para no repetir
// getAbsolutePathBuilder()/path()/build() en cada Controller (ver InscripcionController).
public final class RespuestasRest {

    private RespuestasRest() {}

    // 201 Created + Location hacia el recurso nuevo (RFC 9110 S15.3.2) -- para una PK de un
    // solo valor, que entra directo como path segment.
    public static Response creado(UriInfo uriInfo, Object id, Object entidad) {
        URI ubicacion = uriInfo.getAbsolutePathBuilder().path(String.valueOf(id)).build();
        return Response.created(ubicacion).entity(entidad).build();
    }

    // 201 Created sin Location -- para una PK compuesta que no es un solo path segment
    // limpio (ver EntregaController, misma razon por la que no tiene GET/{id}).
    public static Response creado(Object entidad) {
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }
}

package org.example.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import static org.example.rest.ApplicationConfig.Endpoints.ENDPOINTS;

// Expone la lista de paths REALMENTE activos (ApplicationConfig.listEndpoints(), que lee
// de REGISTRO_ACTIVO) -- el front la consume en client.ts para avisar en desarrollo si
// alguno de los paths que usa ya no esta activo en el backend, en vez de descubrirlo con
// un 404 en producción. No forma parte de REGISTRO_ACTIVO a proposito: es infraestructura
// (como CorsFilter/ValidationExceptionMapper en otros proyectos), no un recurso de dominio.
@Path(ENDPOINTS)
@Produces(MediaType.APPLICATION_JSON)
public class EndpointsController {

    @GET
    public Response listar() {
        return Response.ok(ApplicationConfig.listEndpoints()).build();
    }
}

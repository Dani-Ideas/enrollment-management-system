package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.ejb.ServiceArtifax;

import static org.example.rest.ApplicationConfig.Endpoints.CATALOGOS_INSCRIPCION;

// Un solo endpoint, un solo GET: "tablas genericas" -- los 4 catalogos
// (estados/sistemas/responsables/ambientes) que hoy pide el formulario de inscripcion
// con 4 GET separados, en una sola respuesta. Vive aparte de los 4 Controllers de
// catalogo a proposito: esto no es "el recurso X", es una vista armada para un
// formulario especifico (mismo criterio que FormularioPagoController en
// HelloJakarta-variante).
@Path(CATALOGOS_INSCRIPCION)
@Produces(MediaType.APPLICATION_JSON)
public class CatalogosInscripcionController {

    @EJB
    private ServiceArtifax serviceArtifax;

    @GET
    public Response tablas() {
        return Response.ok(serviceArtifax.tablasInscripcion()).build();
    }
}

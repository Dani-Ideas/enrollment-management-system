package org.example.rest;

import jakarta.ejb.EJB;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.lib.CatalogosInscripcionService;

import static org.example.rest.ApplicationConfig.Endpoints.CATALOGOS_INSCRIPCION;

// Un solo endpoint, un solo GET: "tablas genericas" -- los 4 catalogos
// (estados/sistemas/responsables/ambientes) que hoy pide el formulario de inscripcion
// con 4 GET separados, en una sola respuesta. Vive aparte de los 4 Controllers de
// catalogo a proposito: esto no es "el recurso X", es una vista armada para un
// formulario especifico (mismo criterio que FormularioPagoController en
// HelloJakarta-variante).
//
// Service EXCLUSIVO (CatalogosInscripcionService) en vez de llamar a ServiceArtifax
// directo -- este Controller no necesita saber que el cache de catalogos vive ahi.
@Path(CATALOGOS_INSCRIPCION)
@Produces(MediaType.APPLICATION_JSON)
public class CatalogosInscripcionController {

    @EJB
    private CatalogosInscripcionService catalogosInscripcionService;

    @GET
    public Response tablas() {
        return Response.ok(catalogosInscripcionService.tablas()).build();
    }
}

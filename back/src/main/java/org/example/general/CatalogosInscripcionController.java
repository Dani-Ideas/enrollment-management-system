package org.example.general;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.estaticos.service.CatalogoInscripcionCache;

import static org.example.general.ApplicationConfig.Endpoints.CATALOGOS_INSCRIPCION;

// Un solo endpoint, un solo GET: "tablas genericas" -- los 4 catalogos
// (estados/sistemas/responsables/ambientes) que hoy pide el formulario de inscripcion
// con 4 GET separados, en una sola respuesta. Vive aparte de los 4 Controllers de
// catalogo a proposito: esto no es "el recurso X", es una vista armada para un
// formulario especifico (mismo criterio que FormularioPagoController en
// HelloJakarta-variante).
//
// Llama directo a CatalogoInscripcionCache -- un service intermedio aca era pura indireccion sin
// logica propia (tablasInscripcion() ya vive en el cache de los 4 catalogos, que es
// justamente lo que este endpoint expone).
@RequestScoped
@Path(CATALOGOS_INSCRIPCION)
@Produces(MediaType.APPLICATION_JSON)
public class CatalogosInscripcionController {

    @Inject
    private CatalogoInscripcionCache catalogoInscripcionCache;

    @GET
    public Response tablas() {
        return Response.ok(catalogoInscripcionCache.tablasInscripcion()).build();
    }
}

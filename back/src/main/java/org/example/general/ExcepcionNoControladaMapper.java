package org.example.general;

import jakarta.ejb.EJBException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.ext.Providers;

// Red de seguridad: cualquier excepcion que ningun otro ExceptionMapper atrapa. Jersey elige
// siempre el mapper del tipo mas cercano, asi que este solo corre cuando no hay uno especifico.
// Se registra en el log con su stack trace y el cliente recibe un 500 limpio, sin detalles
// internos.
@Provider
public class ExcepcionNoControladaMapper implements ExceptionMapper<Throwable> {

    private static final System.Logger LOG = System.getLogger(ExcepcionNoControladaMapper.class.getName());

    @Context
    private UriInfo uriInfo;

    @Context
    private Providers providers;

    @Override
    public Response toResponse(Throwable exception) {
        // 404 de ruta inexistente, 405, etc.: ya traen su status (y headers, ej. Allow).
        if (exception instanceof WebApplicationException wae) {
            Response original = wae.getResponse();
            if (original.hasEntity()) {
                return original;
            }
            return Response.fromResponse(ProblemDetails.respuesta(original.getStatusInfo(), null, uriInfo))
                    .replaceAll(original.getHeaders())
                    .type(ProblemDetails.MEDIA_TYPE)
                    .build();
        }
        // Una excepcion de negocio lanzada dentro de un EJB puede llegar envuelta en
        // EJBException: se desenvuelve y se entrega a su mapper (404, 409, 422...).
        if (exception instanceof EJBException && exception.getCause() != null) {
            return delegar(exception.getCause());
        }
        LOG.log(System.Logger.Level.ERROR, "Error no controlado en " + uriInfo.getRequestUri(), exception);
        return ProblemDetails.respuesta(Response.Status.INTERNAL_SERVER_ERROR,
                "Error interno del servidor; el detalle quedo en el log.", uriInfo);
    }

    @SuppressWarnings("unchecked")
    private <T extends Throwable> Response delegar(T causa) {
        ExceptionMapper<T> mapper = providers.getExceptionMapper((Class<T>) causa.getClass());
        return mapper != null ? mapper.toResponse(causa) : toResponse(causa);
    }
}

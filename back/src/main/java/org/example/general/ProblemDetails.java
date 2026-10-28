package org.example.general;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.util.Map;

// Cuerpo UNICO de todas las respuestas de error (RFC 9457, "application/problem+json"): el
// cliente lee siempre "detail" (y "errores" cuando hay errores por campo), sin importar que
// ExceptionMapper respondio. Sin "type": el RFC lo interpreta como "about:blank", y entonces
// "title" es la frase estandar del status HTTP. Los campos null no se serializan.
public record ProblemDetails(
        String title,
        int status,
        String detail,
        String instance,
        Map<String, String> errores
) {

    public static final String MEDIA_TYPE = "application/problem+json";

    // Response.Status no trae constante para 422 (RFC 9110 §15.5.21).
    public static final Response.StatusType UNPROCESSABLE_CONTENT = new Response.StatusType() {
        @Override
        public int getStatusCode() {
            return 422;
        }

        @Override
        public Response.Status.Family getFamily() {
            return Response.Status.Family.CLIENT_ERROR;
        }

        @Override
        public String getReasonPhrase() {
            return "Unprocessable Content";
        }
    };

    public static Response respuesta(Response.StatusType status, String detail, UriInfo uriInfo) {
        return respuesta(status, detail, null, uriInfo);
    }

    public static Response respuesta(Response.StatusType status, String detail,
                                     Map<String, String> errores, UriInfo uriInfo) {
        ProblemDetails cuerpo = new ProblemDetails(
                status.getReasonPhrase(),
                status.getStatusCode(),
                detail,
                uriInfo.getRequestUri().getPath(),
                errores
        );
        return Response.status(status).type(MEDIA_TYPE).entity(cuerpo).build();
    }
}

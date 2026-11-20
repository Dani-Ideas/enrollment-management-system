package org.example.dinamicas.rest;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import org.example.dinamicas.service.NotificacionCorreoService;

import static org.example.general.ApplicationConfig.Endpoints.SOLICITUDES_NOTIFICAR;

@RequestScoped
@Path(SOLICITUDES_NOTIFICAR)
public class NotificacionCorreoController {

    @Inject
    private NotificacionCorreoService notificacionCorreoService;

    @POST
    public Response enviar(@PathParam("solicitudId") Long solicitudId) {
        notificacionCorreoService.enviarConfirmacion(solicitudId);
        return Response.noContent().build();
    }
}

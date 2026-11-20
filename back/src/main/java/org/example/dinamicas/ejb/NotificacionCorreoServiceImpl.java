package org.example.dinamicas.ejb;

import jakarta.annotation.Resource;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.example.comun.RecursoNoEncontradoException;
import org.example.dinamicas.model.SolNInscripcionEty;
import org.example.dinamicas.repository.SolNInscripcionRepository;
import org.example.dinamicas.service.NotificacionCorreoService;

// "mail/matriculasMailSession" y "jndi/correoNotificacionesDestinatario" son recursos de
// GlassFish (no hay seeder/config en este repo para esto, igual que jdbc/matriculasDS): el
// primero via "asadmin create-javamail-resource", el segundo via "asadmin
// create-custom-resource --restype java.lang.String" -- asi el destinatario se puede
// cambiar sin recompilar. jakarta.mail-api ya llega transitivamente por
// jakarta.jakartaee-api (back/pom.xml); GlassFish 8 trae la implementacion (Angus Mail).
@Stateless
public class NotificacionCorreoServiceImpl implements NotificacionCorreoService {

    @Resource(mappedName = "mail/matriculasMailSession")
    private Session mailSession;

    @Resource(mappedName = "jndi/correoNotificacionesDestinatario")
    private String destinatarioFijo;

    @Inject
    private SolNInscripcionRepository solicitudRepository;

    @Override
    public void enviarConfirmacion(Long solicitudId) {
        SolNInscripcionEty solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la solicitud " + solicitudId));

        try {
            MimeMessage mensaje = new MimeMessage(mailSession);
            mensaje.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatarioFijo));
            mensaje.setSubject("Confirmación de nivel " + solicitud.getEtapa().getNombre() + " -- Solicitud #" + solicitudId);
            mensaje.setText(
                    "Proyecto: " + solicitud.getProyecto() + "\n"
                    + "Versión: " + solicitud.getVersion() + "\n"
                    + "Etapa: " + solicitud.getEtapa().getNombre() + "\n"
                    + "Estado: " + solicitud.getEstado().getEstado());
            Transport.send(mensaje);
        } catch (MessagingException e) {
            // Sin excepcion de negocio propia -- sube y la agarra ExcepcionNoControladaMapper
            // (500 limpio), igual que cualquier otro error no previsto.
            throw new RuntimeException("No se pudo enviar el correo de confirmación", e);
        }
    }
}

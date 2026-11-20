package org.example.dinamicas.service;

// Envia el correo de aviso de "confirmación de nivel" del stepper (crear/actualizar, nunca
// consultar) -- ver NotificacionCorreoServiceImpl para los recursos de GlassFish que esto
// necesita (mail session + destinatario fijo).
public interface NotificacionCorreoService {
    void enviarConfirmacion(Long solicitudId);
}

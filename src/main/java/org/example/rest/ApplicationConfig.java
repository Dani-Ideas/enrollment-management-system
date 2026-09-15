package org.example.rest;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

// Registro EXPLICITO (mismo patron que ControllerRegistry en HelloJakarta-variante): si una
// clase no pasa por register(), no se expone, aunque tenga @Path o @Provider.
@ApplicationPath("/api")
public class ApplicationConfig extends ResourceConfig {

    public ApplicationConfig() {
        register(CarreraController.class);
        register(MateriaController.class);
        register(ProfesorController.class);
        register(ClaseController.class);
        register(EstudianteController.class);
        register(MatriculaController.class);
        register(ReglaDeNegocioExceptionMapper.class);
        register(ValidationExceptionMapper.class);
    }
}

package org.example.lib;

// Excepcion de negocio (no de infraestructura) -- capacidad de clase excedida, profesor sin
// habilitacion, profesor con 3 clases ya asignadas, estudiante ya matriculado, etc. Se
// traduce a 409 Conflict en rest/ReglaDeNegocioExceptionMapper, con el mensaje real (a
// diferencia de un 500 generico) porque es un conflicto esperable de negocio, no un fallo
// del sistema.
public class ReglaDeNegocioException extends RuntimeException {
    public ReglaDeNegocioException(String mensaje) {
        super(mensaje);
    }
}

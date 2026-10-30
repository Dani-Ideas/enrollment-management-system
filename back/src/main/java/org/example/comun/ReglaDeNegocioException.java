package org.example.comun;

// Una regla de negocio impide la operacion (conflicto esperable, no un fallo del sistema).
// Se traduce a 409 Conflict en general/ReglaDeNegocioExceptionMapper, con el mensaje real.
// Para un id inexistente usar RecursoNoEncontradoException (404) o
// ReferenciaInvalidaException (422), no esta.
public class ReglaDeNegocioException extends RuntimeException {
    public ReglaDeNegocioException(String mensaje) {
        super(mensaje);
    }
}

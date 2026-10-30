package org.example.comun;

// Un id que viene en el BODY (FK a un catalogo, id de una formacion complementaria) no
// existe. No es un conflicto de negocio (409) sino una peticion que no se puede procesar:
// se traduce a 422 en general/ReferenciaInvalidaExceptionMapper.
public class ReferenciaInvalidaException extends RuntimeException {
    public ReferenciaInvalidaException(String mensaje) {
        super(mensaje);
    }
}

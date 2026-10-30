package org.example.comun;

// El recurso pedido por la URL (/inscripciones/{id}, /personas/{id}) no existe. Se traduce
// a 404 en general/RecursoNoEncontradoExceptionMapper -- los services la lanzan en vez de
// devolver null, asi ningun Controller tiene que revisar null.
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}

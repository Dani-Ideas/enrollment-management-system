package org.example.dinamicas.dto;

import java.io.Serializable;

// Forma de SALIDA de POST/PUT /inscripciones-secundaria -- a diferencia de
// InscripcionConFormacionComplementariaDto, el diploma NUNCA es una lista ni es opcional:
// toda InscripcionSecundaria tiene exactamente un DiplomaSecundaria.
public record InscripcionSecundariaConDiplomaDto(
        InscripcionSecundariaDto inscripcionSecundaria,
        DiplomaSecundariaDto diplomaSecundaria
) implements Serializable {
}

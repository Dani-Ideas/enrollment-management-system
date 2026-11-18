package org.example.dinamicas.dto;

import java.io.Serializable;

// Forma de SALIDA de POST /inscripciones/{id}/cadena-diplomas -- cada campo es null si ese
// nivel no vino en la peticion (el usuario no siguio hasta ahi), igual semantica "opcional"
// que el request.
public record CadenaDiplomasDto(
        DiplomaPrimariaDto diplomaPrimaria,
        InscripcionSecundariaDto inscripcionSecundaria,
        DiplomaSecundariaDto diplomaSecundaria,
        InscripcionUniversidadDto inscripcionUniversidad,
        DiplomaUniversidadDto diplomaUniversidad
) implements Serializable {
}

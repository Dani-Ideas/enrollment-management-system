package org.example.dinamicas.dto;

import java.io.Serializable;

// Sin FK propia: la PK compartida (y por lo tanto la cadena hacia diploma de primaria) la fija
// InscripcionSecundariaRequestDto.diplomaPrimaria -- este DTO es solo el checklist de firmas.
public record DiplomaSecundariaRequestDto(
        boolean firmaMaestroPrimerGrado,
        boolean firmaMaestroSegundoGrado,
        boolean firmaMaestroTercerGrado,
        boolean firmaOrientador,
        boolean firmaDirectorSecundaria
) implements Serializable {
}

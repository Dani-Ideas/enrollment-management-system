package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// "id" = el mismo valor que InscripcionSecundariaDto.id (PK compartida) = el id original del
// diploma de primaria -- ya no hace falta inscripcionSecundariaId/diplomaPrimariaId por
// separado, los 3 son siempre el mismo numero.
public record DiplomaSecundariaDto(
        Long id,
        boolean firmaMaestroPrimerGrado,
        boolean firmaMaestroSegundoGrado,
        boolean firmaMaestroTercerGrado,
        boolean firmaOrientador,
        boolean firmaDirectorSecundaria,
        boolean emitido,
        LocalDateTime fechaEmision
) implements Serializable {
}

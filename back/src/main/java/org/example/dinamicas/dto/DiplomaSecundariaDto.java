package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record DiplomaSecundariaDto(
        Long id,
        Long inscripcionSecundariaId,
        Long diplomaPrimariaId,
        boolean firmaMaestroPrimerGrado,
        boolean firmaMaestroSegundoGrado,
        boolean firmaMaestroTercerGrado,
        boolean firmaOrientador,
        boolean firmaDirectorSecundaria,
        boolean emitido,
        LocalDateTime fechaEmision
) implements Serializable {
}

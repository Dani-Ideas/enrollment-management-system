package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record DiplomaUniversidadDto(
        Long id,
        Long inscripcionUniversidadId,
        Long diplomaSecundariaId,
        boolean firmaDecanoFacultad,
        boolean firmaCoordinadorCarrera,
        boolean firmaSecretarioAcademico,
        boolean firmaRector,
        boolean emitido,
        LocalDateTime fechaEmision
) implements Serializable {
}

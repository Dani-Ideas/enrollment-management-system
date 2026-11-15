package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// "id" = el mismo id de linaje que todos los niveles anteriores (PK compartida).
public record DiplomaUniversidadDto(
        Long id,
        boolean firmaDecanoFacultad,
        boolean firmaCoordinadorCarrera,
        boolean firmaSecretarioAcademico,
        boolean firmaRector,
        boolean emitido,
        LocalDateTime fechaEmision
) implements Serializable {
}

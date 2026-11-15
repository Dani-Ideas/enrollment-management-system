package org.example.dinamicas.dto;

import java.io.Serializable;

// Sin FK propia: la PK compartida la fija InscripcionUniversidadRequestDto.diplomaSecundaria.
public record DiplomaUniversidadRequestDto(
        boolean firmaDecanoFacultad,
        boolean firmaCoordinadorCarrera,
        boolean firmaSecretarioAcademico,
        boolean firmaRector
) implements Serializable {
}

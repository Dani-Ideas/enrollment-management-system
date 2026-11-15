package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// "diplomaSecundaria": la FK de encadenamiento contra el nivel anterior.
public record DiplomaUniversidadRequestDto(
        @NotNull Long diplomaSecundaria,
        boolean firmaDecanoFacultad,
        boolean firmaCoordinadorCarrera,
        boolean firmaSecretarioAcademico,
        boolean firmaRector
) implements Serializable {
}

package org.example.dinamicas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record InscripcionUniversidadConDiplomaRequestDto(
        @NotNull @Valid InscripcionUniversidadRequestDto inscripcionUniversidad,
        @NotNull @Valid DiplomaUniversidadRequestDto diplomaUniversidad
) implements Serializable {
}

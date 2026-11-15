package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

public record InscripcionUniversidadRequestDto(
        @NotNull Long estado,
        @NotNull Long sistema,
        @NotNull Long jefeCarrera,
        @NotNull Long maestro,
        @NotNull Long carrera,
        @NotNull Long ambiente,
        @NotNull @Size(max = 255) String proyecto,
        @NotNull @Size(max = 50) String version,
        String descripcion,
        @NotNull LocalDateTime fechaInscripcionPlanteada,
        LocalDateTime fechaInscripcionReal
) implements Serializable {
}

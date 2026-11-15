package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

// "diplomaPrimaria": el id del diploma de primaria que esta inscripcion de secundaria pasa a
// compartir como PK (ver InscripcionSecundariaEty) -- es inmutable una vez creada la fila
// (InscripcionSecundariaMapper.actualizarDesde la ignora).
public record InscripcionSecundariaRequestDto(
        @NotNull Long diplomaPrimaria,
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

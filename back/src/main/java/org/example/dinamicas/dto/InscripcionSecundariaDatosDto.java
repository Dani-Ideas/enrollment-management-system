package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

// Igual que InscripcionSecundariaRequestDto pero SIN "diplomaPrimaria": usado dentro de
// CadenaDiplomasRequestDto, donde el diploma de primaria encadenado es el que se acaba de
// crear (o ya existia) en la MISMA peticion, nunca un id suelto que el cliente tenga que
// conocer de antemano.
public record InscripcionSecundariaDatosDto(
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

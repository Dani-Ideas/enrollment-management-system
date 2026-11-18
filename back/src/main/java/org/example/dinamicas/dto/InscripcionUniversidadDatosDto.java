package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

// Igual que InscripcionUniversidadRequestDto pero SIN "diplomaSecundaria": mismo motivo que
// InscripcionSecundariaDatosDto -- el diploma de secundaria encadenado es el que se acaba de
// crear en la MISMA peticion.
public record InscripcionUniversidadDatosDto(
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

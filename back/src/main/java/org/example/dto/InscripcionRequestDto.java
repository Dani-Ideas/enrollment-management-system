package org.example.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

// Forma de ENTRADA (POST/PUT) -- a diferencia de InscripcionDto (salida, todo aplanado a texto
// legible), aqui las relaciones viajan como id suelto (estadoId, sistemaId, etc.) -- el
// cliente manda ids, el servidor resuelve las entidades reales.
public record InscripcionRequestDto(
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

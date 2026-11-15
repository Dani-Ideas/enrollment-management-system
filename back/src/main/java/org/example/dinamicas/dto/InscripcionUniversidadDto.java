package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record InscripcionUniversidadDto(
        Long id,
        String estado,
        String sistema,
        String jefeCarrera,
        String maestro,
        String carrera,
        String ambiente,
        String proyecto,
        String version,
        String descripcion,
        LocalDateTime fechaInscripcionPlanteada,
        LocalDateTime fechaInscripcionReal
) implements Serializable {
}

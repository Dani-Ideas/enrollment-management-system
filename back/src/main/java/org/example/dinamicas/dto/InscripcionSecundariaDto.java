package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// Mismo aplanado que InscripcionDto (Primaria), nivel Secundaria.
public record InscripcionSecundariaDto(
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

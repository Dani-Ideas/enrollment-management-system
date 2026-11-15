package org.example.dinamicas.dto;

import java.io.Serializable;

public record InscripcionUniversidadConDiplomaDto(
        InscripcionUniversidadDto inscripcionUniversidad,
        DiplomaUniversidadDto diplomaUniversidad
) implements Serializable {
}

package org.example.dto;

import java.io.Serializable;

public record ClaseDto(
        Long id,
        MateriaDto materia,
        ProfesorDto profesor,
        // Calculado por el service (cupo maximo 3 - matriculas EN_CURSO), no lo genera el
        // Mapper -- MapStruct solo hace mapeo estructural, esto es un agregado que necesita
        // consultar MatriculaRepository.
        int cuposDisponibles
) implements Serializable {
}

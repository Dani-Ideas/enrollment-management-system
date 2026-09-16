package org.example.dto;

import org.example.model.EstadoMatricula;

import java.io.Serializable;
import java.time.LocalDate;

public record MatriculaDto(
        Long id,
        Long estudianteId,
        String estudianteUsername,
        ClaseDto clase,
        EstadoMatricula estado,
        LocalDate fechaInscripcion,
        LocalDate fechaCompletada
) implements Serializable {
}

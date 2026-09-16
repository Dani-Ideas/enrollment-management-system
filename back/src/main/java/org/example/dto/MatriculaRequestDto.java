package org.example.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// El DTO de entrada del endpoint central del sistema: "un estudiante se matricula en una
// clase". Deliberadamente minimo -- estado/fechaInscripcion/fechaCompletada los decide el
// servidor (ver MatriculaBuilder), el cliente no los manda.
public record MatriculaRequestDto(
        @NotNull
        Long estudianteId,
        @NotNull
        Long claseId
) implements Serializable {
}

package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record PersonaRequestDto(
        @NotNull Long id,
        @NotNull String nombre
) implements Serializable {
}

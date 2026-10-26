package org.example.estaticos.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record EstadoRequestDto(
        @NotNull Long id,
        @NotNull String nombre,
        @NotNull Long paisId
) implements Serializable {
}

package org.example.estaticos.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record MunicipioRequestDto(
        @NotNull Long id,
        @NotNull String nombre,
        @NotNull Long estadoId
) implements Serializable {
}

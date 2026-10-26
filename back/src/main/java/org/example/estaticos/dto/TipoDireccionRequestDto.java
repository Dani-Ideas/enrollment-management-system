package org.example.estaticos.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record TipoDireccionRequestDto(
        @NotNull Long id,
        @NotNull String descripcion
) implements Serializable {
}

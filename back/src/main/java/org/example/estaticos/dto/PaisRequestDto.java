package org.example.estaticos.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record PaisRequestDto(
        @NotNull Long id,
        @NotNull String nombre,
        String isoCode
) implements Serializable {
}

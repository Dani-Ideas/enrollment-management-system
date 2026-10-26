package org.example.estaticos.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record ColoniaRequestDto(
        @NotNull Long id,
        @NotNull String nombre,
        String codigoPostal,
        String tipoAsentamiento,
        @NotNull Long municipioId
) implements Serializable {
}

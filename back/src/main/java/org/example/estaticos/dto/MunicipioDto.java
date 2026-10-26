package org.example.estaticos.dto;

import java.io.Serializable;

public record MunicipioDto(
        Long id,
        String nombre,
        String estado
) implements Serializable {
}

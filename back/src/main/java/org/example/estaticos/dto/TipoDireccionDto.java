package org.example.estaticos.dto;

import java.io.Serializable;

public record TipoDireccionDto(
        Long id,
        String descripcion
) implements Serializable {
}

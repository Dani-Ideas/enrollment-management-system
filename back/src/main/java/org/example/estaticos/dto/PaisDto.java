package org.example.estaticos.dto;

import java.io.Serializable;

public record PaisDto(
        Long id,
        String nombre,
        String isoCode
) implements Serializable {
}

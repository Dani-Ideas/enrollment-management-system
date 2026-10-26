package org.example.estaticos.dto;

import java.io.Serializable;

public record EstadoDto(
        Long id,
        String nombre,
        String pais
) implements Serializable {
}

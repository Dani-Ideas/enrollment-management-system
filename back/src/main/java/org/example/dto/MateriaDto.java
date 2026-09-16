package org.example.dto;

import java.io.Serializable;

public record MateriaDto(
        Long id,
        String nombre,
        Integer anio,
        Long carreraId,
        String carreraNombre
) implements Serializable {
}

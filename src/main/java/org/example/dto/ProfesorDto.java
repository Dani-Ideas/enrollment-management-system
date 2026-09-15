package org.example.dto;

import java.io.Serializable;
import java.util.List;

public record ProfesorDto(
        Long id,
        String nombre,
        Long carreraId,
        String carreraNombre,
        List<MateriaDto> habilitaciones
) implements Serializable {
}

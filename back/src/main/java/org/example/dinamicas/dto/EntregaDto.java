package org.example.dinamicas.dto;

import java.io.Serializable;

public record EntregaDto(
        DireccionDto direccion,
        String materia
) implements Serializable {
}

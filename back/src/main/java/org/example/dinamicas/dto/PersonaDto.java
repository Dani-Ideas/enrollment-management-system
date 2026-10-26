package org.example.dinamicas.dto;

import java.io.Serializable;

public record PersonaDto(
        Long id,
        String nombre
) implements Serializable {
}

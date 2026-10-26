package org.example.dinamicas.dto.dinamica;

import java.io.Serializable;

public record PersonaDto(
        Long id,
        String nombre
) implements Serializable {
}

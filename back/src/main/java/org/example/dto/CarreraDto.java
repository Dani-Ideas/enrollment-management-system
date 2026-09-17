package org.example.dto;

import java.io.Serializable;

public record CarreraDto(
        Long id,
        String nombre
) implements Serializable {
}
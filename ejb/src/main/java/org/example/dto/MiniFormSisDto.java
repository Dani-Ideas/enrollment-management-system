package org.example.dto;

import java.io.Serializable;

public record MiniFormSisDto(
        Long id,
        String nombre
) implements Serializable {
}

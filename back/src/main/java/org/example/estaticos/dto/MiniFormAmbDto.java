package org.example.estaticos.dto;

import java.io.Serializable;

public record MiniFormAmbDto(
        Long id,
        String nombre
) implements Serializable {
}

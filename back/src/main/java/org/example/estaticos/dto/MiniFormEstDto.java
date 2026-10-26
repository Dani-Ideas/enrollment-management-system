package org.example.estaticos.dto;

import java.io.Serializable;

public record MiniFormEstDto(
        Long id,
        String estado
) implements Serializable {
}

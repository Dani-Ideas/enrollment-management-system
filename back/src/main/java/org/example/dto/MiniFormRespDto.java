package org.example.dto;

import java.io.Serializable;

public record MiniFormRespDto(
        Long id,
        String nombreLargo
) implements Serializable {
}

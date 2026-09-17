package org.example.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// DTO de ENTRADA para el login -- separado de EstudianteRequestDto (que es para CREAR una
// cuenta) porque la forma es distinta: login no lleva carreraId, y la semantica es otra
// (verificar credenciales existentes, no crear nada nuevo).
public record LoginRequestDto(
        @NotNull String username,
        @NotNull String password
) implements Serializable {
}

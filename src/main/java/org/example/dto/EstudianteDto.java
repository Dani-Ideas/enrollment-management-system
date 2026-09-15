package org.example.dto;

import java.io.Serializable;

// Sin "password"/"passwordHash" a proposito -- nunca sale del servidor.
public record EstudianteDto(
        Long id,
        String username,
        Long carreraId,
        String carreraNombre
) implements Serializable {
}

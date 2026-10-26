package org.example.estaticos.dto;

import java.io.Serializable;

public record ColoniaDto(
        Long id,
        String nombre,
        String codigoPostal,
        String tipoAsentamiento,
        String municipio
) implements Serializable {
}

package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// Los 3 ids forman la PK compuesta de DireccionEty (FKs a persona, colonia y tipo_direccion).
public record DireccionRequestDto(
        @NotNull Long personaId,
        @NotNull Long coloniaId,
        @NotNull Long tipoId,
        String codigoPostal,
        String calle,
        String numeroExterior,
        String numeroInterior,
        String entreCalles,
        String referencias,
        boolean principal
) implements Serializable {
}

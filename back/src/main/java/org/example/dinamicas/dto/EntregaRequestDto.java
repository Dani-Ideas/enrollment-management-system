package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// Los 3 ids resuelven la direccion (PK compuesta de DireccionEty) que es, a su vez, la PK
// entera de EntregaEty (relacion identificadora -- ver EntregaEty/EntregaId).
public record EntregaRequestDto(
        @NotNull Long personaId,
        @NotNull Long coloniaId,
        @NotNull Long tipoId,
        String materia
) implements Serializable {
}

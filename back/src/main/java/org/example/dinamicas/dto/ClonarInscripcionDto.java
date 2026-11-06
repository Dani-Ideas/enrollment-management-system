package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

// DTO2 de ejemplo: una SEGUNDA forma de entrada para llegar a un InscripcionEty, distinta de
// InscripcionRequestDto (DTO1) -- aca no se manda el catalogo/responsables completos, solo
// de cual inscripcion partir y que proyecto ponerle. Ver InscripcionMapper.clonarDesde().
public record ClonarInscripcionDto(
        @NotNull Long inscripcionOrigenId,
        @NotNull @Size(max = 255) String nuevoProyecto
) implements Serializable {
}

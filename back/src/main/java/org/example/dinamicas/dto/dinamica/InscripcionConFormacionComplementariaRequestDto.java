package org.example.dinamicas.dto.dinamica;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.List;

public record InscripcionConFormacionComplementariaRequestDto(
        @NotNull @Valid InscripcionRequestDto inscripcion,
        @NotNull
        List<FormacionComplementariaRequestDto> formacionesComplementarias
) implements Serializable {
}
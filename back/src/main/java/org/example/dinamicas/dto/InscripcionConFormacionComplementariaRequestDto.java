package org.example.dinamicas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.List;

// formacionesComplementarias es opcional: en el PUT, null = no tocar las formaciones
// existentes; una lista (aunque sea vacia) = la lista completa que debe quedar.
public record InscripcionConFormacionComplementariaRequestDto(
        @NotNull @Valid InscripcionRequestDto inscripcion,
        @Valid List<FormacionComplementariaRequestDto> formacionesComplementarias
) implements Serializable {
}
package org.example.dinamicas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

// A diferencia de InscripcionConFormacionComplementariaRequestDto (formaciones opcionales),
// aqui "diplomaSecundaria" es obligatorio en POST y PUT: siempre trae la FK de encadenamiento
// contra el diploma de primaria, que el service revalida en cada llamada.
public record InscripcionSecundariaConDiplomaRequestDto(
        @NotNull @Valid InscripcionSecundariaRequestDto inscripcionSecundaria,
        @NotNull @Valid DiplomaSecundariaRequestDto diplomaSecundaria
) implements Serializable {
}

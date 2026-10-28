package org.example.dinamicas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

// Forma de ENTRADA, siempre dentro de InscripcionConFormacionComplementariaRequestDto: la
// inscripcion duena la decide el servidor (la URL del PUT o la recien creada en el POST), por
// eso no viaja inscripcionId.
public record FormacionComplementariaRequestDto(
        Long id, // null = formacion nueva; con id = actualizar esa formacion
        @NotNull @Size(max = 255) String descripcion
) implements Serializable {
}

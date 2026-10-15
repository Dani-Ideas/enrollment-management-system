package org.example.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

// Forma de ENTRADA -- sin "id" (lo genera la base). inscripcionId viaja explicito (no hay
// forma de inferirlo solo, a diferencia de un PATCH bajo /inscripciones/{id}/formaciones-
// complementarias -- se eligio mandar el FK en el body para que el endpoint de creacion sea
// uno solo, /formaciones-complementarias, sin depender de anidar la ruta bajo
// /inscripciones/{id}).
public record FormacionComplementariaRequestDto(
        Long id,// este es para las actualizaciones
        Long inscripcionId,// este no se exige que este lleno para las nuevas
        @NotNull @Size(max = 255) String descripcion
) implements Serializable {
}

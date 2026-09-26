package org.example.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.List;

// Forma de ENTRADA de POST /inscripciones -- une en UNA sola peticion lo que antes eran 2
// (POST /inscripciones + N POST /formaciones-complementarias en cadena). "inscripcion" es
// el InscripcionRequestDto de siempre (@Valid para que sus propias validaciones tambien
// corran); "formacionesComplementarias" son solo las descripciones -- el inscripcionId de
// cada una no viaja porque todavia no existe (lo resuelve CatalogosInscripcionServiceImpl
// DESPUES de crear la Inscripcion, dentro de la misma transaccion). Lista vacia o null =
// "sin formaciones complementarias", igual que antes.
public record InscripcionCompuestaRequestDto(
        @NotNull @Valid InscripcionRequestDto inscripcion,
        List<String> formacionesComplementarias
) implements Serializable {
}

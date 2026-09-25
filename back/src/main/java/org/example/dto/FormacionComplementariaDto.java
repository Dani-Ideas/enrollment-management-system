package org.example.dto;

import java.io.Serializable;

// Forma de SALIDA -- a diferencia de FormDto, aqui SI se expone inscripcionId tal cual
// (no hay nada que aplanar a texto: el FK apunta de vuelta a la Inscripcion dueña, no a
// un catalogo con nombre legible).
public record FormacionComplementariaDto(
        Long id,
        Long inscripcionId,
        String descripcion
) implements Serializable {
}

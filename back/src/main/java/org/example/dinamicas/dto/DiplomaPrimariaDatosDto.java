package org.example.dinamicas.dto;

import java.io.Serializable;

// Igual que DiplomaPrimariaRequestDto pero SIN "inscripcion": usado dentro de
// CadenaDiplomasRequestDto, donde la Inscripcion ya viene fija por la URL
// (POST /inscripciones/{id}/cadena-diplomas) -- repetirla aca seria redundante.
public record DiplomaPrimariaDatosDto(
        boolean firmaMaestro1ro,
        boolean firmaMaestro2do,
        boolean firmaMaestro3ro,
        boolean firmaMaestro4to,
        boolean firmaMaestro5to,
        boolean firmaMaestro6to,
        boolean firmaDirectorPrimaria
) implements Serializable {
}

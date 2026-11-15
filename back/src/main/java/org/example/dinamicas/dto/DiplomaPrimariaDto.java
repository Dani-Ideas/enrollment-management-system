package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// Forma de SALIDA -- inscripcionId va tal cual (el FK apunta a la Inscripcion duena, no a un
// catalogo con texto legible), mismo criterio que FormacionComplementariaDto.inscripcionId.
public record DiplomaPrimariaDto(
        Long id,
        Long inscripcionId,
        boolean firmaMaestro1ro,
        boolean firmaMaestro2do,
        boolean firmaMaestro3ro,
        boolean firmaMaestro4to,
        boolean firmaMaestro5to,
        boolean firmaMaestro6to,
        boolean firmaDirectorPrimaria,
        boolean emitido,
        LocalDateTime fechaEmision
) implements Serializable {
}

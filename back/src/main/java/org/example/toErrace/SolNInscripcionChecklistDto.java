package org.example.toErrace;

import java.io.Serializable;

public record SolNInscripcionChecklistDto(
        Integer id,
        String inscripcion,
        String etapaInscripcion,
        String estado,
        String responsable,
        String seccion,
        String actividad,
        String descripcion,
        String conexion,
        String comentario
) implements Serializable {
}

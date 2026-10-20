package org.example.toErrace;

import java.io.Serializable;

public record SolNInscripcionChecklistTemplateDto(
        Integer idTipoArquitectura,
        String tipoArquitectura,
        String nombre,
        Integer orden,
        String etapaInscripcion,
        String seccion,
        String actividad,
        String descripcion,
        String conexion,
        String comentario
) implements Serializable {
}

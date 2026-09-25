package org.example.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// Forma de SALIDA -- deliberadamente aplanada a strings (estado/sistema/responsables/
// ambiente), calcada del SELECT real que se uso como fuente de verdad. No trae objetos
// anidados (a diferencia de ClaseDto, por ejemplo) porque lo que se pidio es exactamente
// ese reporte, no un grafo de entidades completo. Los campos NO se renombraron junto con
// las tablas/clases (sigue siendo "estado"/"sistema"/...) para no romper el JSON que ya
// consume el frontend.
public record FormDto(
        Long id,
        String estado,
        String sistema,
        String jefeCarrera,
        String maestro,
        String carrera,
        String ambiente,
        String proyecto,
        String version,
        String descripcion,
        LocalDateTime fechaInscripcionPlanteada,
        LocalDateTime fechaInscripcionReal
) implements Serializable {
}

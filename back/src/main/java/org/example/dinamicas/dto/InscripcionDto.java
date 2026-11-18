package org.example.dinamicas.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

// Forma de SALIDA -- deliberadamente aplanada a strings (estado/sistema/responsables/
// ambiente), calcada del SELECT real que se uso como fuente de verdad. No trae un grafo de
// entidades completo porque lo que se pidio es exactamente ese reporte. Los campos NO se
// renombraron junto con las tablas/clases (sigue siendo "estado"/"sistema"/...) para no
// romper el JSON que ya consume el frontend.
// diplomaPrimariaId: null si esta Inscripcion (Primaria) todavia no tiene diploma -- el
// frontend lo usa para saber, apenas carga esta Inscripcion, si ya existe una cadena
// Secundaria/Universidad para traer (el id del diploma de primaria ES el id de linaje
// compartido por toda la cadena, ver DiplomaPrimariaEty/InscripcionSecundariaEty).
public record InscripcionDto(
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
        LocalDateTime fechaInscripcionReal,
        Long diplomaPrimariaId
) implements Serializable {
}

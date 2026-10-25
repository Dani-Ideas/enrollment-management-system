package org.example.dto;

import java.io.Serializable;
import java.util.List;

// Forma de SALIDA de POST /inscripciones -- la Inscripcion recien creada mas las
// formaciones complementarias que se crearon junto con ella (ya con su id real), en la
// misma respuesta -- espejo de InscripcionConFormacionComplementariaRequestDto.
public record InscripcionConFormacionComplementariaDto(
        InscripcionDto inscripcion,
        List<FormacionComplementariaDto> formacionesComplementarias
) implements Serializable {
}

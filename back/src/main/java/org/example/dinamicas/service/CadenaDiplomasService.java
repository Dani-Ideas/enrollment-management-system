package org.example.dinamicas.service;

import org.example.dinamicas.dto.CadenaDiplomasDto;
import org.example.dinamicas.dto.CadenaDiplomasRequestDto;

public interface CadenaDiplomasService {
    CadenaDiplomasDto crear(Long inscripcionId, CadenaDiplomasRequestDto dto);

    // "Upsert": actualiza cada nivel que ya existe, crea el que no -- usado por "actualizar"
    // (PUT), que puede estar retomando una cadena a medio llenar.
    CadenaDiplomasDto actualizar(Long inscripcionId, CadenaDiplomasRequestDto dto);
}

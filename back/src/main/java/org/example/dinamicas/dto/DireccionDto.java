package org.example.dinamicas.dto;

import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.PaisDto;

import java.io.Serializable;

import java.time.LocalDateTime;

public record DireccionDto(
        PersonaDto personaId,
        Long tipoId,
        String tipo,
        ColoniaDto colonia,
        MunicipioDto municipio,
        EstadoDto estado,
        PaisDto pais,
        String calle,
        String numeroExterior,
        String numeroInterior,
        String entreCalles,
        String referencias,
        boolean principal,
        LocalDateTime creadoEn
) implements Serializable {
}

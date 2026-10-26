package org.example.dinamicas.dto.dinamica;

import java.io.Serializable;

import java.time.LocalDateTime;

public record DireccionDto(
        Long personaId,
        Long coloniaId,
        Long tipoId,
        String tipo,
        String colonia,
        String municipio,
        String estado,
        String pais,
        String codigoPostal,
        String calle,
        String numeroExterior,
        String numeroInterior,
        String entreCalles,
        String referencias,
        boolean principal,
        LocalDateTime creadoEn
) implements Serializable {
}

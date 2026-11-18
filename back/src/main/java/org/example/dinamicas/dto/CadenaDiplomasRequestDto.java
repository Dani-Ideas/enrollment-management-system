package org.example.dinamicas.dto;

import jakarta.validation.Valid;

import java.io.Serializable;

// Forma de ENTRADA de POST /inscripciones/{id}/cadena-diplomas -- continua la cadena
// Primaria/Secundaria/Universidad en UNA sola peticion HTTP a partir de una InscripcionEty
// (Primaria) que YA existe (el id va en la URL, no aca). Cada nivel es OPCIONAL (null = el
// usuario no siguio hasta ahi en el front), pero son ACUMULATIVOS en orden: no puede venir
// "inscripcionSecundaria" sin "diplomaPrimaria" en la MISMA peticion, ni "diplomaSecundaria"
// sin "inscripcionSecundaria", etc. -- CadenaDiplomasServiceImpl valida y crea todo en una
// sola transaccion, aplicando las mismas reglas de completitud que ya existian para los
// endpoints separados (DiplomaPrimariaServiceImpl/InscripcionSecundariaServiceImpl/
// InscripcionUniversidadServiceImpl), pero contra los datos recien enviados en vez de filas
// ya persistidas -- nada tiene id todavia hasta que esta peticion termina.
public record CadenaDiplomasRequestDto(
        @Valid DiplomaPrimariaDatosDto diplomaPrimaria,
        @Valid InscripcionSecundariaDatosDto inscripcionSecundaria,
        @Valid DiplomaSecundariaRequestDto diplomaSecundaria,
        @Valid InscripcionUniversidadDatosDto inscripcionUniversidad,
        @Valid DiplomaUniversidadRequestDto diplomaUniversidad
) implements Serializable {
}

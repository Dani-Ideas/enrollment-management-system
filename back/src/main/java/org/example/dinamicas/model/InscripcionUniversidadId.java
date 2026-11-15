package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de InscripcionUniversidadEty: su PK es SOLO la relacion con DiplomaSecundariaEty
// (shared primary key), que a su vez tiene PK compuesta -- mismo patron recursivo.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class InscripcionUniversidadId implements Serializable {

    private DiplomaSecundariaId diplomaSecundaria;
}

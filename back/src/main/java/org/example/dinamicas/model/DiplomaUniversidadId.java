package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de DiplomaUniversidadEty: su PK es SOLO la relacion con InscripcionUniversidadEty
// (shared primary key) -- cierra la cadena. El valor Long real, en la base, es siempre el
// mismo (el id de DiplomaPrimariaEty) propagado por los 4 niveles via PK compartida.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DiplomaUniversidadId implements Serializable {

    private InscripcionUniversidadId inscripcionUniversidad;
}

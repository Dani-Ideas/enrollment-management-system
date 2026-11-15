package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de DiplomaSecundariaEty: su PK es SOLO la relacion con InscripcionSecundariaEty
// (shared primary key) -- como esa a su vez tiene PK compuesta (InscripcionSecundariaId), el
// campo aca es del tipo de esa IdClass, no de Long directo (mismo patron recursivo que
// EntregaId.direccion: DireccionId porque DireccionEty tiene PK compuesta).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DiplomaSecundariaId implements Serializable {

    private InscripcionSecundariaId inscripcionSecundaria;
}

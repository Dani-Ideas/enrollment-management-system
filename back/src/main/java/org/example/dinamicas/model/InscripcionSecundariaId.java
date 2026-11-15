package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de InscripcionSecundariaEty (@IdClass). La PK de InscripcionSecundariaEty es SOLO
// la relacion con DiplomaPrimariaEty (shared primary key, igual mecanismo que EntregaEty con
// DireccionEty): no se puede crear una InscripcionSecundaria sin un DiplomaPrimaria real, y
// la base de datos lo garantiza a nivel de esquema (PK compartida), no solo con una regla de
// negocio en el service. Un solo campo porque DiplomaPrimariaEty tiene PK simple (Long).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class InscripcionSecundariaId implements Serializable {

    private Long diplomaPrimaria;
}

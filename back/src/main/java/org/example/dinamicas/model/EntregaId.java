package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de EntregaEty (@IdClass). Como ahora la PK de EntregaEty es SOLO la relacion
// con DireccionEty (relacion identificadora 1:1, @PrimaryKeyJoinColumns), esta IdClass
// tiene un solo campo: "direccion", con el mismo nombre que el @Id de la entidad, tipado
// DireccionId porque DireccionEty ya tiene PK compuesta.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EntregaId implements Serializable {

    private DireccionId direccion;
}

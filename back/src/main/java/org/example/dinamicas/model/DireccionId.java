package org.example.dinamicas.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

// Id class de DireccionEty (@IdClass): sin anotaciones JPA. Cada campo se llama igual que el
// @Id de DireccionEty y tiene el tipo de la PK de la entidad a la que apunta.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DireccionId implements Serializable {

    private Long persona;
    private Long colonia;
    private Long tipo;
}

package org.example.dinamicas.dinamica;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "persona")
public class PersonaEty {

    @Id
    @Column(name = "id_persona")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;
}

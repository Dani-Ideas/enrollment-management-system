package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Dato estatico (no tiene endpoint de escritura) -- se siembra en DatosIniciales. Sin
// coleccion "materias" a proposito: se consulta via MateriaRepository.findAll() filtrado
// en el service, no hay lado inverso de relacion que mantener sincronizado.
@Getter
@Setter
@Entity
@Table(name = "CARRERA")
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "carrera_seq")
    @SequenceGenerator(name = "carrera_seq", sequenceName = "CARRERA_SEQ", allocationSize = 1)
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE", nullable = false, unique = true)
    private String nombre;

    public Carrera() {
    }
}

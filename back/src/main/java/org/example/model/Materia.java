package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Dato estatico. "anio" (1..5): junto con "carrera", arma el plan de estudio completo --
// 25 materias por carrera = 5 anios x 5 materias, sin necesitar una entidad aparte para
// "plan de estudio", es una consulta (MateriaRepository.findAll() filtrado por carrera).
@Getter
@Setter
@Entity
@Table(name = "MATERIA")
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "materia_seq")
    @SequenceGenerator(name = "materia_seq", sequenceName = "MATERIA_SEQ", allocationSize = 1)
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "ANIO", nullable = false)
    private Integer anio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    public Materia() {
    }
}

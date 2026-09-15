package org.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Una "clase" es una oferta concreta de una Materia, a cargo de UN Profesor. La lista de
// estudiantes matriculados (maximo 3) tampoco es un campo aqui -- Matricula es la unica
// fuente de verdad de "quien esta en que clase" (ver ClaseServiceImpl/MatriculaServiceImpl).
@Getter
@Setter
@Entity
@Table(name = "CLASE")
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "clase_seq")
    @SequenceGenerator(name = "clase_seq", sequenceName = "CLASE_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_id", nullable = false)
    private Profesor profesor;

    public Clase() {
    }
}

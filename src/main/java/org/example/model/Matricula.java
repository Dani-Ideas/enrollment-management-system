package org.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDate;

// El corazon del sistema: registra que un Estudiante se anoto a una Clase. Es a la vez
// "el cupo de la clase" (contar Matricula con estado=EN_CURSO por clase) y "el historial
// del estudiante" (contar/listar Matricula con estado=COMPLETADA por estudiante) -- una
// sola tabla, sin duplicar el dato en dos lados.
@Getter
@Setter
@Entity
@Table(name = "MATRICULA")
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "matricula_seq")
    @SequenceGenerator(name = "matricula_seq", sequenceName = "MATRICULA_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clase_id", nullable = false)
    private Clase clase;

    @Enumerated(EnumType.STRING)
    private EstadoMatricula estado;

    private LocalDate fechaInscripcion;

    // null hasta que la materia se completa.
    private LocalDate fechaCompletada;

    public Matricula() {
    }
}

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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// El "historial de cursos completados" no es un campo aqui -- se consulta via
// MatriculaRepository.findAll() filtrado por estudiante + estado=COMPLETADA (ver
// EstudianteServiceImpl.historial()). Evita otro ciclo de relacion y una segunda fuente de
// verdad sobre el mismo dato que ya vive en Matricula.
@Getter
@Setter
@Entity
@Table(name = "ESTUDIANTE")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "estudiante_seq")
    @SequenceGenerator(name = "estudiante_seq", sequenceName = "ESTUDIANTE_SEQ", allocationSize = 1)
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "USERNAME", nullable = false, unique = true)
    private String username;

    // Nunca texto plano -- ver builder/PasswordHasher.java. Nunca aparece en ningun DTO de
    // salida (EstudianteDto no tiene este campo).
    @NotNull
    @Column(name = "PASSWORD_HASH", nullable = false)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    public Estudiante() {
    }
}

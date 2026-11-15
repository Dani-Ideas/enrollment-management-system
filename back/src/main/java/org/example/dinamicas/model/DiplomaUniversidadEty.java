package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// 1:1 con InscripcionUniversidadEty. "diplomaSecundaria" es la FK de encadenamiento: no se
// puede inscribir en universidad sin un diploma de secundaria completo (la regla la valida
// InscripcionUniversidadServiceImpl). Nombres de firma son placeholder, igual que en
// DiplomaSecundariaEty.
@Getter
@Setter
@Entity
@Table(name = "DIPLOMA_UNIVERSIDAD")
public class DiplomaUniversidadEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "diploma_universidad_seq")
    @SequenceGenerator(name = "diploma_universidad_seq", sequenceName = "DIPLOMA_UNIVERSIDAD_SEQ", allocationSize = 1)
    @Column(name = "ID_DIPLOMA_UNIVERSIDAD")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INSCRIPCION_UNIVERSIDAD", nullable = false, unique = true)
    private InscripcionUniversidadEty inscripcionUniversidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_DIPLOMA_SECUNDARIA", nullable = false)
    private DiplomaSecundariaEty diplomaSecundaria;

    @Column(name = "FIRMA_DECANO_FACULTAD", nullable = false)
    private boolean firmaDecanoFacultad = false;

    @Column(name = "FIRMA_COORDINADOR_CARRERA", nullable = false)
    private boolean firmaCoordinadorCarrera = false;

    @Column(name = "FIRMA_SECRETARIO_ACADEMICO", nullable = false)
    private boolean firmaSecretarioAcademico = false;

    @Column(name = "FIRMA_RECTOR", nullable = false)
    private boolean firmaRector = false;

    @Column(name = "EMITIDO", nullable = false)
    private boolean emitido = false;

    @Column(name = "FECHA_EMISION")
    private LocalDateTime fechaEmision;
}

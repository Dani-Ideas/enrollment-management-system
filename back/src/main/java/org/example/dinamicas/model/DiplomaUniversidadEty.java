package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Cierra la cadena: PK compartida con InscripcionUniversidadEty, identidad derivada simple
// (sin @IdClass). Nombres de firma son placeholder, igual que en DiplomaSecundariaEty.
@Getter
@Setter
@Entity
@Table(name = "DIPLOMA_UNIVERSIDAD")
public class DiplomaUniversidadEty {

    @Id
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DIPLOMA_PRIMARIA", nullable = false)
    private InscripcionUniversidadEty inscripcionUniversidad;

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

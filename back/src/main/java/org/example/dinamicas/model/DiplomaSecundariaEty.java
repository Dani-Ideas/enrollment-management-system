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

// PK compartida con InscripcionSecundariaEty (que a su vez comparte la suya con
// DiplomaPrimariaEty, PK simple) -- identidad derivada simple, sin @IdClass (ver nota en
// InscripcionSecundariaEty). Ya no hace falta una FK propia "diplomaPrimaria": la cadena
// completa (diploma_primaria -> inscripcion_secundaria -> diploma_secundaria) es, a nivel de
// valor, UN SOLO id Long compartido via PK encadenada.
// Nombres de firma son un placeholder razonable (el usuario no detallo los roles exactos de
// secundaria, solo dijo "el mismo modelo" que primaria).
@Getter
@Setter
@Entity
@Table(name = "DIPLOMA_SECUNDARIA")
public class DiplomaSecundariaEty {

    @Id
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DIPLOMA_PRIMARIA", nullable = false)
    private InscripcionSecundariaEty inscripcionSecundaria;

    @Column(name = "FIRMA_MAESTRO_1ER_GRADO", nullable = false)
    private boolean firmaMaestroPrimerGrado = false;

    @Column(name = "FIRMA_MAESTRO_2DO_GRADO", nullable = false)
    private boolean firmaMaestroSegundoGrado = false;

    @Column(name = "FIRMA_MAESTRO_3ER_GRADO", nullable = false)
    private boolean firmaMaestroTercerGrado = false;

    @Column(name = "FIRMA_ORIENTADOR", nullable = false)
    private boolean firmaOrientador = false;

    @Column(name = "FIRMA_DIRECTOR_SECUNDARIA", nullable = false)
    private boolean firmaDirectorSecundaria = false;

    @Column(name = "EMITIDO", nullable = false)
    private boolean emitido = false;

    @Column(name = "FECHA_EMISION")
    private LocalDateTime fechaEmision;
}

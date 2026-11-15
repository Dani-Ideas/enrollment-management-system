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

// 1:1 con InscripcionSecundariaEty (ID_INSCRIPCION_SECUNDARIA), igual que DiplomaPrimariaEty
// con InscripcionEty. "diplomaPrimaria" es la FK de encadenamiento: no se puede inscribir en
// secundaria sin un diploma de primaria completo (la regla la valida
// InscripcionSecundariaServiceImpl, no esta entidad).
//
// Nombres de firma son un placeholder razonable (el usuario no detallo los roles exactos de
// secundaria, solo dijo "el mismo modelo" que primaria) -- renombrar columnas aca es un
// cambio de una linea, no estructural.
@Getter
@Setter
@Entity
@Table(name = "DIPLOMA_SECUNDARIA")
public class DiplomaSecundariaEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "diploma_secundaria_seq")
    @SequenceGenerator(name = "diploma_secundaria_seq", sequenceName = "DIPLOMA_SECUNDARIA_SEQ", allocationSize = 1)
    @Column(name = "ID_DIPLOMA_SECUNDARIA")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INSCRIPCION_SECUNDARIA", nullable = false, unique = true)
    private InscripcionSecundariaEty inscripcionSecundaria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_DIPLOMA_PRIMARIA", nullable = false)
    private DiplomaPrimariaEty diplomaPrimaria;

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

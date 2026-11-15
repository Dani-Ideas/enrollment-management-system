package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// 1:1 con InscripcionEty (Primaria) por FK (ID_INSCRIPCION), mismo sentido que
// FormacionComplementariaEty -> InscripcionEty: el hijo apunta al padre.
//
// Las firmas son el checklist de aprobacion de cada autoridad (maestros de 1ro a 6to grado
// mas el director); "emitido"/"fechaEmision" los calcula el service (nunca llegan del
// cliente), igual que InscripcionEty.fechaInscripcionReal: null hasta que de verdad se emite.
@Getter
@Setter
@Entity
@Table(name = "DIPLOMA_PRIMARIA")
public class DiplomaPrimariaEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "diploma_primaria_seq")
    @SequenceGenerator(name = "diploma_primaria_seq", sequenceName = "DIPLOMA_PRIMARIA_SEQ", allocationSize = 1)
    @Column(name = "ID_DIPLOMA_PRIMARIA")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INSCRIPCION", nullable = false, unique = true)
    private InscripcionEty inscripcion;

    @Column(name = "FIRMA_MAESTRO_1RO", nullable = false)
    private boolean firmaMaestro1ro = false;

    @Column(name = "FIRMA_MAESTRO_2DO", nullable = false)
    private boolean firmaMaestro2do = false;

    @Column(name = "FIRMA_MAESTRO_3RO", nullable = false)
    private boolean firmaMaestro3ro = false;

    @Column(name = "FIRMA_MAESTRO_4TO", nullable = false)
    private boolean firmaMaestro4to = false;

    @Column(name = "FIRMA_MAESTRO_5TO", nullable = false)
    private boolean firmaMaestro5to = false;

    @Column(name = "FIRMA_MAESTRO_6TO", nullable = false)
    private boolean firmaMaestro6to = false;

    @Column(name = "FIRMA_DIRECTOR_PRIMARIA", nullable = false)
    private boolean firmaDirectorPrimaria = false;

    @Column(name = "EMITIDO", nullable = false)
    private boolean emitido = false;

    // Null hasta que todas las firmas estan completas (ver DiplomaPrimariaServiceImpl).
    @Column(name = "FECHA_EMISION")
    private LocalDateTime fechaEmision;
}

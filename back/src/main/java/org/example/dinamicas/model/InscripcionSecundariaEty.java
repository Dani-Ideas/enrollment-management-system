package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.example.estaticos.model.MiniFormAmbEty;
import org.example.estaticos.model.MiniFormEstEty;
import org.example.estaticos.model.MiniFormRespEty;
import org.example.estaticos.model.MiniFormSisEty;

import java.time.LocalDateTime;

// Nivel "Secundaria" de la cadena Primaria/Secundaria/Universidad -- mismo esqueleto que
// InscripcionEty (Primaria), tabla y secuencia propias. No reemplaza a InscripcionEty, es
// paralela: cada nivel tiene su propia Inscripcion y su propio Diploma (ver
// DiplomaSecundariaEty, que es quien de verdad encadena contra el diploma de Primaria).
@Getter
@Setter
@Entity
@Table(name = "INSCRIPCION_SECUNDARIA")
public class InscripcionSecundariaEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inscripcion_secundaria_seq")
    @SequenceGenerator(name = "inscripcion_secundaria_seq", sequenceName = "INSCRIPCION_SECUNDARIA_SEQ", allocationSize = 1)
    @Column(name = "ID_INSCRIPCION_SECUNDARIA")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMEST", nullable = false)
    private MiniFormEstEty estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMSIS", nullable = false)
    private MiniFormSisEty sistema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMRESP_PROYECTO", nullable = false)
    private MiniFormRespEty jefeCarrera;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMRESP_DESARROLLO", nullable = false)
    private MiniFormRespEty maestro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMRESP_IMPLANTACION", nullable = false)
    private MiniFormRespEty carrera;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMAMB", nullable = false)
    private MiniFormAmbEty ambiente;

    @NotNull
    @Size(max = 255)
    @Column(name = "PROYECTO", nullable = false)
    private String proyecto;

    @NotNull
    @Size(max = 50)
    @Column(name = "VERSION", nullable = false)
    private String version;

    @Lob
    @Column(name = "DESCRIPCION")
    private String descripcion;

    @NotNull
    @Column(name = "FECHA_IMPLANTACION_PLANTEADA", nullable = false)
    private LocalDateTime fechaInscripcionPlanteada;

    @Column(name = "FECHA_IMPLANTACION_REAL")
    private LocalDateTime fechaInscripcionReal;

    // Lado inverso de DiplomaSecundariaEty.inscripcionSecundaria. Sin cascade, solo lectura
    // -- mismo patron que InscripcionEty.diplomaPrimaria.
    @OneToOne(mappedBy = "inscripcionSecundaria", fetch = FetchType.LAZY)
    private DiplomaSecundariaEty diplomaSecundaria;
}

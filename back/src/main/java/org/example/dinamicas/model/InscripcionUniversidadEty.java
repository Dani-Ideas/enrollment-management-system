package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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

// PK compartida con DiplomaSecundariaEty -- mismo mecanismo que InscripcionSecundariaEty con
// DiplomaPrimariaEty, un nivel arriba.
@Getter
@Setter
@Entity
@IdClass(InscripcionUniversidadId.class)
@Table(name = "INSCRIPCION_UNIVERSIDAD")
public class InscripcionUniversidadEty {

    @Id
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DIPLOMA_PRIMARIA", nullable = false)
    private DiplomaSecundariaEty diplomaSecundaria;

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

    @OneToOne(mappedBy = "inscripcionUniversidad", fetch = FetchType.LAZY)
    private DiplomaUniversidadEty diplomaUniversidad;
}

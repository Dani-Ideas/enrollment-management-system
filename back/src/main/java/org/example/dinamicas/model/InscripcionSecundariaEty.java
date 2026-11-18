package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
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

// PK compartida con DiplomaPrimariaEty: identidad derivada de un solo @OneToOne (JPA 3.2
// S2.4.1.3, caso simple -- el mismo ejemplo "EmployeeInfo" del spec, @Id + @OneToOne +
// @JoinColumn liso, SIN @IdClass). @IdClass solo hace falta cuando el destino tiene una PK
// de VARIAS columnas (ver EntregaEty/DireccionEty, PK de 3 columnas) -- no es el caso aca:
// DiplomaPrimariaEty tiene PK simple (Long), asi que el tipo de id de esta entidad es
// tambien Long, sin envoltorio. No existe un ID_INSCRIPCION_SECUNDARIA propio: la propia fila
// ES, por identidad, un diploma de primaria completo (la regla de negocio la valida
// InscripcionSecundariaServiceImpl al crear). Esto garantiza a nivel de esquema que no puede
// existir una inscripcion de secundaria sin un diploma de primaria real detras.
@Getter
@Setter
@Entity
@Table(name = "INSCRIPCION_SECUNDARIA")
public class InscripcionSecundariaEty {

    @Id
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DIPLOMA_PRIMARIA", nullable = false)
    private DiplomaPrimariaEty diplomaPrimaria;

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

    // Lado inverso de DiplomaSecundariaEty.inscripcionSecundaria. Sin cascade, solo lectura.
    @OneToOne(mappedBy = "inscripcionSecundaria", fetch = FetchType.LAZY)
    private DiplomaSecundariaEty diplomaSecundaria;
}

package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Tabla INSCRIPCION -- la entidad principal del dominio "solicitud/inscripcion". Distinta
// de "Solicitud" a proposito: la tabla SOL_SOLICITUD ya existia de antes (sin tocar) y es
// un concepto DISTINTO -- usar el mismo nombre en Java hubiera sido confuso.
//
// Las 6 relaciones son casi toda la tabla (MiniFormEstEty, MiniFormSisEty, 3x MiniFormRespEty con
// roles distintos, MiniFormAmbEty) -- son FK hacia catalogos clave-valor chicos, no relaciones
// de negocio complejas. Los nombres de campo Java (estado/sistema/jefeCarrera/...)
// NO cambiaron -- solo el TIPO de cada uno -- para no tocar ningun DTO ni el JSON de la API.
@Getter
@Setter
@Entity
@Table(name = "INSCRIPCION")
public class InscripcionEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inscripcion_seq")
    @SequenceGenerator(name = "inscripcion_seq", sequenceName = "INSCRIPCION_SEQ", allocationSize = 1)
    @Column(name = "ID_INSCRIPCION")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMEST", nullable = false)
    private MiniFormEstEty estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINIFORMSIS", nullable = false)
    private MiniFormSisEty sistema;

    // Mismo tipo (MiniFormRespEty) usado 3 veces con roles distintos -- exactamente el mismo
    // patron que el SELECT original (3 JOIN separados contra la tabla de responsables).
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

    // @Lob: la columna real es CLOB (texto largo), no VARCHAR -- sin esta anotacion
    // EclipseLink mapearia el String como VARCHAR y chocaria con el tipo ya existente.
    @Lob
    @Column(name = "DESCRIPCION")
    private String descripcion;

    @NotNull
    @Column(name = "FECHA_IMPLANTACION_PLANTEADA", nullable = false)
    private LocalDateTime fechaInscripcionPlanteada;

    // Null hasta que la inscripcion realmente se ejecuta.
    @Column(name = "FECHA_IMPLANTACION_REAL")
    private LocalDateTime fechaInscripcionReal;

    public InscripcionEty() {
    }
}

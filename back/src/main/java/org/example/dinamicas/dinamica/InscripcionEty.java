package org.example.dinamicas.dinamica;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
import java.util.ArrayList;
import java.util.List;

// Entidad principal del dominio "solicitud/inscripcion". No se llama "Solicitud" porque la
// tabla SOL_SOLICITUD ya existe y es otro concepto.
//
// Las 6 relaciones son FK a catalogos clave-valor chicos (MiniFormRespEty se usa 3 veces,
// con roles distintos).
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

    // Lado inverso de FormacionComplementariaEty.inscripcion. Sin cascade a proposito: los
    // hijos se insertan/actualizan/borran explicitamente con FormacionComplementariaRepository
    // (ver InscripcionServiceImpl), esta coleccion solo se lee.
    @OneToMany(mappedBy = "inscripcion", fetch = FetchType.LAZY)
    private List<FormacionComplementariaEty> formacionesComplementarias = new ArrayList<>();
}

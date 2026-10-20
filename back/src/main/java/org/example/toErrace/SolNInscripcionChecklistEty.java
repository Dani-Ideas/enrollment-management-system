package org.example.toErrace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.example.model.InscripcionEty;
import org.example.model.MiniFormEstEty;
import org.example.model.MiniFormRespEty;

@Getter
@Setter
@Entity
@Table(name = "SOL_N_INSCRIPCION_CHECKLIST")
public class SolNInscripcionChecklistEty {
    @Id
    @Column(name = "id_inscripcion_checklist", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_inscripcion", nullable = false)
    private InscripcionEty idInscripcion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_etapa_inscripcion", nullable = false)
    private CatEtapaInscripcionEty idEtapaInscripcion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado", nullable = false)
    private MiniFormEstEty idEstado;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_responsable", nullable = false)
    private MiniFormRespEty idResponsable;

    @Size(max = 100)
    @NotNull
    @Column(name = "seccion", nullable = false, length = 100)
    private String seccion;

    @Size(max = 100)
    @NotNull
    @Column(name = "actividad", nullable = false, length = 100)
    private String actividad;

    @Size(max = 100)
    @NotNull
    @Column(name = "descripcion", nullable = false, length = 100)
    private String descripcion;

    @Size(max = 100)
    @NotNull
    @Column(name = "conexion", nullable = false, length = 100)
    private String conexion;

    @Size(max = 100)
    @Column(name = "comentario", length = 100)
    private String comentario;
}

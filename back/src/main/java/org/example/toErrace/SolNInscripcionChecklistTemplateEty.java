package org.example.toErrace;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "SOL_N_INSCRIPCION_CHECKLIST_TEMPLATE")
public class SolNInscripcionChecklistTemplateEty {
    @EmbeddedId
    private SolNInscripcionChecklistTemplateId id;

    @MapsId("idTipoArquitectura")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_arquitectura", nullable = false)
    private CatTipoArquitecturaEty idTipoArquitectura;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_etapa_inscripcion", nullable = false)
    private CatEtapaInscripcionEty idEtapaInscripcion;

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

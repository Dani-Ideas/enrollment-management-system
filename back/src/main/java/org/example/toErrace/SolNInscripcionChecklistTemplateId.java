package org.example.toErrace;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class SolNInscripcionChecklistTemplateId implements Serializable {
    @NotNull
    @Column(name = "id_tipo_arquitectura", nullable = false)
    private Integer idTipoArquitectura;

    @Size(max = 100)
    @NotNull
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotNull
    @Column(name = "orden", nullable = false)
    private Integer orden;
}

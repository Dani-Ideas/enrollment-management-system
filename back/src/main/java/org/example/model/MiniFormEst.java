package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// Tabla MINIFORMEST -- catalogo del dominio "solicitud/implantacion" (distinto del dominio
// academico del resto del proyecto). Nombre de tabla/entidad renombrado a pedido (antes
// CAT_ESTADO/Estado) -- a diferencia del rename de MiniFormResp, aca no habia ningun typo
// heredado de un sistema externo que preservar.
@Getter
@Setter
@Entity
@ToString
@Table(name = "MINIFORMEST")
public class MiniFormEst {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "miniformest_seq")
    @SequenceGenerator(name = "miniformest_seq", sequenceName = "MINIFORMEST_SEQ", allocationSize = 1)
    @Column(name = "ID_MINIFORMEST")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "ESTADO", nullable = false)
    private String estado;

    public MiniFormEst() {
    }
}

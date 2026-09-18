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

// Tabla MINIFORMRESP (antes CAT_RESPONSABLE/Responsable) -- catalogo del dominio
// "solicitud/implantacion". El typo historico de la columna PK ("id_reponsable") se
// corrige aca a proposito: ese typo se habia preservado antes porque asi vino en el SELECT
// fuente real de esa tabla -- este rename ya es un esquema propio, sin ninguna atadura a
// ese sistema externo.
@Getter
@Setter
@Entity
@Table(name = "MINIFORMRESP")
public class MiniFormResp {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "miniformresp_seq")
    @SequenceGenerator(name = "miniformresp_seq", sequenceName = "MINIFORMRESP_SEQ", allocationSize = 1)
    @Column(name = "ID_MINIFORMRESP")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE_LARGO", nullable = false)
    private String nombreLargo;

    public MiniFormResp() {
    }
}

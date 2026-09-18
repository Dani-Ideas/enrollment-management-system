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

// Tabla MINIFORMAMB (antes CAT_AMBIENTE/Ambiente) -- ambiente de despliegue de una
// implantacion (ej. "Produccion", "QA"), dominio "solicitud/implantacion".
@Getter
@Setter
@Entity
@Table(name = "MINIFORMAMB")
public class MiniFormAmb {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "miniformamb_seq")
    @SequenceGenerator(name = "miniformamb_seq", sequenceName = "MINIFORMAMB_SEQ", allocationSize = 1)
    @Column(name = "ID_MINIFORMAMB")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    public MiniFormAmb() {
    }
}

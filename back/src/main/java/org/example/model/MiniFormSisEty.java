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

// Tabla MINIFORMSIS (antes CAT_SISTEMA/Sistema) -- "sistema" aqui es un sistema de TI sobre
// el que se pide una inscripcion (dominio "solicitud/inscripcion"), sin relacion con el
// nombre del proyecto SistemaMatriculas ni con ninguna entidad academica.
@Getter
@Setter
@Entity
@Table(name = "MINIFORMSIS")
public class MiniFormSisEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "miniformsis_seq")
    @SequenceGenerator(name = "miniformsis_seq", sequenceName = "MINIFORMSIS_SEQ", allocationSize = 1)
    @Column(name = "ID_MINIFORMSIS")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    public MiniFormSisEty() {
    }
}

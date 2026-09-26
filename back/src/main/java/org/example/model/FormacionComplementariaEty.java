package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Tabla FORMACION_COMPLEMENTARIA -- 1:N con InscripcionEty por FK (ID_INSCRIPCION). Sin
// datos sembrados por ningun @Startup -- las unicas filas que existen las crea el propio
// endpoint en tiempo de ejecucion, asi que renombrar columnas aca nunca deja nada huerfano.
@Getter
@Setter
@Entity
@Table(name = "FORMACION_COMPLEMENTARIA")
public class FormacionComplementariaEty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "formacion_complementaria_seq")
    @SequenceGenerator(name = "formacion_complementaria_seq", sequenceName = "FORMACION_COMPLEMENTARIA_SEQ", allocationSize = 1)
    @Column(name = "ID_FORMACION_COMPLEMENTARIA")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INSCRIPCION", nullable = false)
    private InscripcionEty inscripcion;

    @NotNull
    @Size(max = 255)
    @Column(name = "DESCRIPCION", nullable = false)
    private String descripcion;

    public FormacionComplementariaEty() {
    }
}

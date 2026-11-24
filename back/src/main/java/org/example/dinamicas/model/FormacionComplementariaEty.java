package org.example.dinamicas.model;

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

// 1:N con InscripcionEty (legacy) o con SolNInscripcionEty (nuevas altas de cualquier nivel) --
// exactamente una de las dos FK se puebla por fila, decidido por el service que inserta
// (nunca por el cliente), nunca ambas ni ninguna.
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
    @JoinColumn(name = "ID_INSCRIPCION", nullable = true)
    private InscripcionEty inscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SOL_N_INSCRIPCION", nullable = true)
    private SolNInscripcionEty solicitud;

    @NotNull
    @Size(max = 255)
    @Column(name = "DESCRIPCION", nullable = false)
    private String descripcion;
}

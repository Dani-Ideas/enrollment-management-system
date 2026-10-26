package org.example.dinamicas.dinamica;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.estaticos.model.ColoniaEty;
import org.example.estaticos.model.TipoDireccionEty;

import java.time.LocalDateTime;

// PK compuesta derivada de sus 3 relaciones (@EmbeddedId + @MapsId). Depende de cat
// (ColoniaEty, TipoDireccionEty); cat nunca depende de dinamica.
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "direccion")
public class DireccionEty {

    @EmbeddedId
    private DireccionId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("personaId")
    @JoinColumn(name = "id_persona")
    private PersonaEty persona;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("coloniaId")
    @JoinColumn(name = "id_colonia")
    private ColoniaEty colonia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("tipoId")
    @JoinColumn(name = "id_tipo")
    private TipoDireccionEty tipo;

    // Snapshot del CP al momento del registro: si cambia el de la colonia, la direccion
    // historica no cambia sola.
    @Column(name = "codigo_postal", length = 5)
    private String codigoPostal;

    @Column(name = "calle", length = 200)
    private String calle;

    @Column(name = "numero_exterior", length = 20)
    private String numeroExterior;

    @Column(name = "numero_interior", length = 20)
    private String numeroInterior;

    @Column(name = "entre_calles", length = 300)
    private String entreCalles;

    @Column(name = "referencias", length = 500)
    private String referencias;

    @Column(name = "principal", nullable = false)
    private boolean principal = false;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    // EclipseLink no tiene @CreationTimestamp (es de Hibernate).
    @PrePersist
    private void alCrear() {
        creadoEn = LocalDateTime.now();
    }
}

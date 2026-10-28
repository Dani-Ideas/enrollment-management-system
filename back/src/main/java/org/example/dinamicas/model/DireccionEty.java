package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.estaticos.model.ColoniaEty;
import org.example.estaticos.model.TipoDireccionEty;

import java.time.LocalDateTime;

// PK compuesta formada por sus 3 relaciones (@IdClass + @Id sobre cada @ManyToOne, JPA
// 3.2 §2.4.2.3). Depende de estaticos (ColoniaEty, TipoDireccionEty); estaticos nunca
// depende de dinamicas.
@Getter
@Setter
@NoArgsConstructor
@Entity
@IdClass(DireccionId.class)
@Table(name = "direccion")
public class DireccionEty {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_persona", nullable = false)
    private PersonaEty persona;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_colonia", nullable = false)
    private ColoniaEty colonia;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo", nullable = false)
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

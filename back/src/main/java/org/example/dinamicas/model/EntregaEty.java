package org.example.dinamicas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.PrimaryKeyJoinColumns;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Ejercicio: la PK de "entrega" (id_entrega) NO es un campo propio -- es la MISMA PK de
// "direccion" (relacion identificadora / shared primary key). La anotacion especifica para
// esto es @PrimaryKeyJoinColumn(s): el javadoc de la propia anotacion dice que sirve para
// (a) unir una subclase JOINED con su superclase, y (b) un @OneToOne donde la PK de ESTA
// entidad es tambien FK hacia la otra -- exactamente este caso. Por eso la relacion es
// @OneToOne (cardinalidad 1:1 real: cada entrega "es" una direccion), no @ManyToOne.
// Como DireccionEty tiene PK compuesta (persona+colonia+tipo), hacen falta 3
// @PrimaryKeyJoinColumn (una por columna de esa PK) en vez de uno solo.
@Getter
@Setter
@NoArgsConstructor
@Entity
@IdClass(EntregaId.class)
@Table(name = "entrega")
public class EntregaEty {

    @Id
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @PrimaryKeyJoinColumns({
            @PrimaryKeyJoinColumn(name = "id_persona", referencedColumnName = "id_persona"),
            @PrimaryKeyJoinColumn(name = "id_colonia", referencedColumnName = "id_colonia"),
            @PrimaryKeyJoinColumn(name = "id_tipo", referencedColumnName = "id_tipo")
    })
    private DireccionEty direccion;

    @Column(name = "materia", length = 150)
    private String materia;

    // Variantes descartadas, comentadas para comparar (ver conversacion):
    //
    // 1) @ManyToOne + @JoinColumns + @IdClass con un SEGUNDO campo propio en la PK (p.ej.
    //    "diploma" ademas de "direccion"): valida, pero es un caso distinto -- ahi la PK
    //    es COMPUESTA por la FK + otro campo, no la FK sola. Esa es la variante con la que
    //    arranque este archivo antes de que el ejemplo de la tabla se aclarara.
    //
    // 2) @EmbeddedId + @MapsId: tambien valida para "shared primary key", pero mete un
    //    objeto embebido en vez de dejar "direccion" como el unico @Id suelto:
    //
    //    @EmbeddedId
    //    private EntregaId id;
    //
    //    @MapsId
    //    @OneToOne(fetch = FetchType.LAZY, optional = false)
    //    @PrimaryKeyJoinColumns({...})
    //    private DireccionEty direccion;
}

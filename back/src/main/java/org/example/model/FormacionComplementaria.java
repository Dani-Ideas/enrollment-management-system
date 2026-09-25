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

// Renombrada a pedido: antes FormElemento/FORM_ELEMENTO -- esta vez SI se cambio la tabla
// fisica (no solo el nombre Java), a diferencia del rename de jefeCarrera/maestro/carrera
// en Form.java. Ahi no se toco el @JoinColumn porque ya habia datos sembrados reales
// (DatosInicialesForm) que se hubieran quedado huerfanos; aqui no hay ningun dato sembrado
// -- las unicas filas que existian eran de pruebas por curl de esta misma sesion, asi que
// renombrar la tabla entera (create-or-extend-tables crea FORMACION_COMPLEMENTARIA nueva,
// FORM_ELEMENTO queda vacia/huerfana en el H2) no pierde nada real.
@Getter
@Setter
@Entity
@Table(name = "FORMACION_COMPLEMENTARIA")
public class FormacionComplementaria {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "formacion_complementaria_seq")
    @SequenceGenerator(name = "formacion_complementaria_seq", sequenceName = "FORMACION_COMPLEMENTARIA_SEQ", allocationSize = 1)
    @Column(name = "ID_FORMACION_COMPLEMENTARIA")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_FORM", nullable = false)
    private Form inscripcion;

    @NotNull
    @Size(max = 255)
    @Column(name = "DESCRIPCION", nullable = false)
    private String descripcion;

    public FormacionComplementaria() {
    }
}

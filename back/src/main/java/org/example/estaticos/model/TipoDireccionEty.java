package org.example.estaticos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tipo_direccion")
public class TipoDireccionEty {

    @Id
    @Column(name = "id_tipo")
    private Long id;

    @Column(name = "descripcion", nullable = false, length = 50)
    private String descripcion;
}

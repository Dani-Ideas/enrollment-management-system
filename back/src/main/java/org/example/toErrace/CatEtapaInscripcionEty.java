package org.example.toErrace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "CAT_ETAPA_INSCRIPCION")
public class CatEtapaInscripcionEty {
    @Id
    @Column(name = "id_etapa_inscripcion", nullable = false)
    private Integer id;

    @Size(max = 30)
    @Column(name = "nombre", length = 30)
    private String nombre;
}

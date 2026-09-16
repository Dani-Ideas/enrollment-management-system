package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

// Dato estatico. "habilitaciones": TODAS las materias que este profesor PODRIA dictar
// (puede haber 20) -- no confundir con las clases que dicta AHORA (maximo 3 a la vez, eso
// se cuenta via ClaseRepository.findAll() filtrado por profesor, no es un campo propio,
// nunca queda desincronizado). La regla del limite de 3 se aplica en ClaseBuilder al crear
// una Clase, no aqui.
@Getter
@Setter
@Entity
@Table(name = "PROFESOR")
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "profesor_seq")
    @SequenceGenerator(name = "profesor_seq", sequenceName = "PROFESOR_SEQ", allocationSize = 1)
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    @ManyToMany
    @JoinTable(
            name = "PROFESOR_HABILITACION",
            joinColumns = @JoinColumn(name = "profesor_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    private List<Materia> habilitaciones = new ArrayList<>();

    public Profesor() {
    }
}

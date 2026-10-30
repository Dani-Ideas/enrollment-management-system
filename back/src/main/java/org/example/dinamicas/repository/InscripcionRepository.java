package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.InscripcionEty;

import java.util.List;

@Repository
public interface InscripcionRepository extends CrudRepository<InscripcionEty, Long> {

    // Listado con sus 6 catalogos en UN solo SELECT (JOIN FETCH). Con findAll(), cada
    // @ManyToOne LAZY se cargaba al mapear a DTO: N+1 consultas. Las 6 FK son NOT NULL,
    // asi que el INNER JOIN no deja fuera ninguna inscripcion.
    @Query("""
            SELECT i FROM InscripcionEty i
            JOIN FETCH i.estado
            JOIN FETCH i.sistema
            JOIN FETCH i.jefeCarrera
            JOIN FETCH i.maestro
            JOIN FETCH i.carrera
            JOIN FETCH i.ambiente
            ORDER BY i.id""")
    List<InscripcionEty> listarConCatalogos();
}

package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.InscripcionSecundariaEty;

import java.util.List;

@Repository
public interface InscripcionSecundariaRepository extends CrudRepository<InscripcionSecundariaEty, Long> {

    // Mismo motivo que InscripcionRepository.listarConCatalogos(): evitar N+1 al aplanar a
    // DTO. Las 6 FK son NOT NULL, INNER JOIN no deja fuera ninguna fila.
    @Query("""
            SELECT i FROM InscripcionSecundariaEty i
            JOIN FETCH i.estado
            JOIN FETCH i.sistema
            JOIN FETCH i.jefeCarrera
            JOIN FETCH i.maestro
            JOIN FETCH i.carrera
            JOIN FETCH i.ambiente
            ORDER BY i.id""")
    List<InscripcionSecundariaEty> listarConCatalogos();
}

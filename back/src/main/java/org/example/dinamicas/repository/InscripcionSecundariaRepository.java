package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.model.InscripcionSecundariaId;

import java.util.List;

@Repository
public interface InscripcionSecundariaRepository extends CrudRepository<InscripcionSecundariaEty, InscripcionSecundariaId> {

    // "i.id" no existe (la PK es la relacion "diplomaPrimaria", PK compartida) -- se ordena
    // navegando hasta el Long real.
    @Query("""
            SELECT i FROM InscripcionSecundariaEty i
            JOIN FETCH i.estado
            JOIN FETCH i.sistema
            JOIN FETCH i.jefeCarrera
            JOIN FETCH i.maestro
            JOIN FETCH i.carrera
            JOIN FETCH i.ambiente
            ORDER BY i.diplomaPrimaria.id""")
    List<InscripcionSecundariaEty> listarConCatalogos();
}

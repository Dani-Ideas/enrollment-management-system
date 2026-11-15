package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.model.InscripcionUniversidadId;

import java.util.List;

@Repository
public interface InscripcionUniversidadRepository extends CrudRepository<InscripcionUniversidadEty, InscripcionUniversidadId> {

    @Query("""
            SELECT i FROM InscripcionUniversidadEty i
            JOIN FETCH i.estado
            JOIN FETCH i.sistema
            JOIN FETCH i.jefeCarrera
            JOIN FETCH i.maestro
            JOIN FETCH i.carrera
            JOIN FETCH i.ambiente
            ORDER BY i.diplomaSecundaria.inscripcionSecundaria.diplomaPrimaria.id""")
    List<InscripcionUniversidadEty> listarConCatalogos();
}

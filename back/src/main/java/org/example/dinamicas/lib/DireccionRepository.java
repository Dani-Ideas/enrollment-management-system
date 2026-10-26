package org.example.dinamicas.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.dinamica.DireccionEty;
import org.example.dinamicas.dinamica.DireccionId;

import java.util.List;

@Repository
public interface DireccionRepository extends CrudRepository<DireccionEty, DireccionId> {

    @Query("FROM DireccionEty WHERE persona.id = ?1")
    List<DireccionEty> porPersona(Long personaId);
}

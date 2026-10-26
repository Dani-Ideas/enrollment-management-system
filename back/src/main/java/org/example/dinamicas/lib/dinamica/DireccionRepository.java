package org.example.dinamicas.lib.dinamica;

import jakarta.data.repository.By;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Find;
import jakarta.data.repository.Repository;
import org.example.dinamicas.dinamica.DireccionEty;
import org.example.dinamicas.dinamica.DireccionId;

import java.util.List;

@Repository
public interface DireccionRepository extends CrudRepository<DireccionEty, DireccionId> {

    @Find
    List<DireccionEty> porPersona(@By("persona.id") Long personaId);
}

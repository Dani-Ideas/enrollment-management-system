package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Query;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.DireccionEty;
import org.example.dinamicas.model.DireccionId;

import java.util.List;

@Repository
public interface DireccionRepository extends CrudRepository<DireccionEty, DireccionId> {

    // JOIN FETCH de toda la cadena que DireccionMapper.toDto() recorre (persona, tipo,
    // colonia -> municipio -> estado -> pais): un solo SELECT en vez de varios por fila.
    // Alias en un JOIN FETCH anidado: extension de EclipseLink (JPQL estandar no lo permite).
    @Query("""
            SELECT d FROM DireccionEty d
            JOIN FETCH d.persona
            JOIN FETCH d.tipo
            JOIN FETCH d.colonia c
            JOIN FETCH c.municipio m
            JOIN FETCH m.estado e
            JOIN FETCH e.pais
            WHERE d.persona.id = ?1""")
    List<DireccionEty> porPersona(Long personaId);
}

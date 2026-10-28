package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.PersonaEty;

@Repository
public interface PersonaRepository extends CrudRepository<PersonaEty, Long> {
}

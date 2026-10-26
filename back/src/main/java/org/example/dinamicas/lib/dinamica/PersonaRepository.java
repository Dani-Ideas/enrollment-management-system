package org.example.dinamicas.lib.dinamica;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.dinamica.PersonaEty;

@Repository
public interface PersonaRepository extends CrudRepository<PersonaEty, Long> {
}

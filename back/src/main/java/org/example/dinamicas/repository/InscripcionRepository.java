package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.InscripcionEty;

@Repository
public interface InscripcionRepository extends CrudRepository<InscripcionEty, Long> {
}

package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.DiplomaSecundariaEty;

@Repository
public interface DiplomaSecundariaRepository extends CrudRepository<DiplomaSecundariaEty, Long> {
}

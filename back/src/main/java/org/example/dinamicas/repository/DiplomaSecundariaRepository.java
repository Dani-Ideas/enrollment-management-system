package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaSecundariaId;

@Repository
public interface DiplomaSecundariaRepository extends CrudRepository<DiplomaSecundariaEty, DiplomaSecundariaId> {
}

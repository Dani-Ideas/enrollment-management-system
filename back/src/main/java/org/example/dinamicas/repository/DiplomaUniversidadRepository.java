package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.DiplomaUniversidadId;

@Repository
public interface DiplomaUniversidadRepository extends CrudRepository<DiplomaUniversidadEty, DiplomaUniversidadId> {
}

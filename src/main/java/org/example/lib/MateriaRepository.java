package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Materia;

@Repository
public interface MateriaRepository extends CrudRepository<Materia, Long> {
}

package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Estudiante;

@Repository
public interface EstudianteRepository extends CrudRepository<Estudiante, Long> {
}

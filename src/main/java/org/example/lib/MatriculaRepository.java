package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Matricula;

@Repository
public interface MatriculaRepository extends CrudRepository<Matricula, Long> {
}

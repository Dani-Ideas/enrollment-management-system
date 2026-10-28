package org.example.dinamicas.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.model.FormacionComplementariaEty;

@Repository
public interface FormacionComplementariaRepository extends CrudRepository<FormacionComplementariaEty, Long> {
}

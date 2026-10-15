package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.FormacionComplementariaEty;

@Repository
public interface FormacionComplementariaRepository extends CrudRepository<FormacionComplementariaEty, Long> {
}

package org.example.dinamicas.lib.dinamica;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.dinamicas.dinamica.FormacionComplementariaEty;

@Repository
public interface FormacionComplementariaRepository extends CrudRepository<FormacionComplementariaEty, Long> {
}

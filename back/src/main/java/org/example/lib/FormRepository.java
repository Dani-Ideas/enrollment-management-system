package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.Form;

@Repository
public interface FormRepository extends CrudRepository<Form, Long> {
}

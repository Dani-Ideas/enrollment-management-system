package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MiniFormSisEty;

@Repository
public interface MiniFormSisRepository extends CrudRepository<MiniFormSisEty, Long> {
}

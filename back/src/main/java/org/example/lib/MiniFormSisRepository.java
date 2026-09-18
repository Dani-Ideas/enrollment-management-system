package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormSis;

@Repository
public interface MiniFormSisRepository extends CrudRepository<MiniFormSis, Long> {
}

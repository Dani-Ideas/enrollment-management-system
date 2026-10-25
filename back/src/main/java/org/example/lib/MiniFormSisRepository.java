package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormSisEty;

@Repository
public interface MiniFormSisRepository extends CrudRepository<MiniFormSisEty, Long> {
}

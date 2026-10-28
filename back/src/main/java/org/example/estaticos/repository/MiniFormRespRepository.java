package org.example.estaticos.repository;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MiniFormRespEty;

@Repository
public interface MiniFormRespRepository extends CrudRepository<MiniFormRespEty, Long> {
}

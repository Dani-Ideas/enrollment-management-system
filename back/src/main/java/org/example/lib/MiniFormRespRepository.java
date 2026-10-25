package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormRespEty;

@Repository
public interface MiniFormRespRepository extends CrudRepository<MiniFormRespEty, Long> {
}

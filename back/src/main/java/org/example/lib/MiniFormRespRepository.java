package org.example.lib;

import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.model.MiniFormResp;

@Repository
public interface MiniFormRespRepository extends CrudRepository<MiniFormResp, Long> {
}

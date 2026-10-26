package org.example.estaticos.lib;

import jakarta.data.repository.Query;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MunicipioEty;

import java.util.List;

@Repository
public interface MunicipioRepository extends CrudRepository<MunicipioEty, Long> {

    @Query("FROM MunicipioEty WHERE estado.id = ?1")
    List<MunicipioEty> porEstado(Long estadoId);
}

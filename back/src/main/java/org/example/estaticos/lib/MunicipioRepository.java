package org.example.estaticos.lib;

import jakarta.data.repository.By;
import jakarta.data.repository.Find;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.MunicipioEty;

import java.util.List;

@Repository
public interface MunicipioRepository extends CrudRepository<MunicipioEty, Long> {

    @Find
    List<MunicipioEty> porEstado(@By("estado.id") Long estadoId);
}

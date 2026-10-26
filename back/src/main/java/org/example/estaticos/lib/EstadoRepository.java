package org.example.estaticos.lib;

import jakarta.data.repository.By;
import jakarta.data.repository.Find;
import jakarta.data.repository.CrudRepository;
import jakarta.data.repository.Repository;
import org.example.estaticos.model.EstadoEty;

import java.util.List;

@Repository
public interface EstadoRepository extends CrudRepository<EstadoEty, Long> {

    @Find
    List<EstadoEty> porPais(@By("pais.id") Long paisId);
}

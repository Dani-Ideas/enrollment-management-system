package org.example.dinamicas.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dinamicas.dto.EntregaDto;
import org.example.dinamicas.dto.EntregaRequestDto;
import org.example.dinamicas.mapper.EntregaMapper;
import org.example.dinamicas.model.EntregaEty;
import org.example.dinamicas.repository.EntregaRepository;
import org.example.dinamicas.service.EntregaService;

import java.util.List;

@Stateless
public class EntregaServiceImpl implements EntregaService {

    @Inject
    private EntregaRepository entregaRepository;

    @Inject
    private EntregaMapper entregaMapper;

    @Override
    public List<EntregaDto> listar() {
        return entregaMapper.toDto(entregaRepository.findAll().toList());
    }
    @Override
    public EntregaDto listarPorId(Long id){ return entregaMapper.toDto(entregaRepository.findById(id));}

    @Override
    public EntregaDto crear(EntregaRequestDto dto) {
        EntregaEty creada = entregaRepository.insert(entregaMapper.toEntity(dto));
        return entregaMapper.toDto(creada);
    }
}

package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.CarreraDto;
import org.example.lib.CarreraRepository;
import org.example.lib.CarreraService;
import org.example.mapper.CarreraMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class CarreraServiceImpl implements CarreraService {

    @Inject
    private CarreraRepository carreraRepository;

    @Inject
    private CarreraMapper carreraMapper;

    @Override
    public List<CarreraDto> listar() {
        return carreraRepository.findAll()
                .map(carreraMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CarreraDto buscarPorId(Long id) {
        return carreraRepository.findById(id).map(carreraMapper::toDto).orElse(null);
    }
}

package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.MiniFormEstDto;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormEstService;
import org.example.mapper.MiniFormEstMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class MiniFormEstServiceImpl implements MiniFormEstService {

    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    @Inject
    private MiniFormEstMapper miniFormEstMapper;

    @Override
    public List<MiniFormEstDto> listar() {
        return miniFormEstRepository.findAll().map(miniFormEstMapper::toDto).collect(Collectors.toList());
    }
}

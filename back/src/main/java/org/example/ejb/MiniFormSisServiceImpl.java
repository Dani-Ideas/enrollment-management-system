package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.MiniFormSisDto;
import org.example.lib.MiniFormSisRepository;
import org.example.lib.MiniFormSisService;
import org.example.mapper.MiniFormSisMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class MiniFormSisServiceImpl implements MiniFormSisService {

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    @Inject
    private MiniFormSisMapper miniFormSisMapper;

    @Override
    public List<MiniFormSisDto> listar() {
        return miniFormSisRepository.findAll().map(miniFormSisMapper::toDto).collect(Collectors.toList());
    }
}

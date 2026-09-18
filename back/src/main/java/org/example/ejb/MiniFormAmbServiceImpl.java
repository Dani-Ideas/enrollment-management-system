package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.MiniFormAmbDto;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormAmbService;
import org.example.mapper.MiniFormAmbMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class MiniFormAmbServiceImpl implements MiniFormAmbService {

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    @Inject
    private MiniFormAmbMapper miniFormAmbMapper;

    @Override
    public List<MiniFormAmbDto> listar() {
        return miniFormAmbRepository.findAll().map(miniFormAmbMapper::toDto).collect(Collectors.toList());
    }
}

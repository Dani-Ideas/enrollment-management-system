package org.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.MiniFormRespDto;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormRespService;
import org.example.mapper.MiniFormRespMapper;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class MiniFormRespServiceImpl implements MiniFormRespService {

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    @Inject
    private MiniFormRespMapper miniFormRespMapper;

    @Override
    public List<MiniFormRespDto> listar() {
        return miniFormRespRepository.findAll().map(miniFormRespMapper::toDto).collect(Collectors.toList());
    }
}

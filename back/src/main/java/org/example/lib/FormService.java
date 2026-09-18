package org.example.lib;

import org.example.dto.FormDto;
import org.example.dto.FormRequestDto;

import java.util.List;

public interface FormService {

    List<FormDto> listar();

    FormDto buscarPorId(Long id);

    FormDto crear(FormRequestDto dto);

    FormDto actualizar(Long id, FormRequestDto dto);
}

package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.estaticos.dto.MiniFormSisDto;
import org.example.estaticos.repository.MiniFormSisRepository;
import org.example.comun.ReferenciaInvalidaException;
import org.example.estaticos.model.MiniFormSisEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Ver MiniFormEstMapper -- mismo criterio: desdeId() resuelve la FK contra la base aca
// mismo, via CDI, en vez de devolver un stub.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class MiniFormSisMapper {

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    public abstract MiniFormSisDto toDto(MiniFormSisEty sistema);

    public MiniFormSisEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return miniFormSisRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el sistema " + id));
    }
}

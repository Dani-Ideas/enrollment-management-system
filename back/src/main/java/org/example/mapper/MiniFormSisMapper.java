package org.example.mapper;

import jakarta.inject.Inject;
import org.example.dto.MiniFormSisDto;
import org.example.lib.MiniFormSisRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.model.MiniFormSisEty;
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
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el sistema " + id));
    }
}

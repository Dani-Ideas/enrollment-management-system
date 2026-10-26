package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.estaticos.dto.MiniFormAmbDto;
import org.example.estaticos.lib.MiniFormAmbRepository;
import org.example.comun.ReglaDeNegocioException;
import org.example.estaticos.model.MiniFormAmbEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Ver MiniFormEstMapper -- mismo criterio: desdeId() resuelve la FK contra la base aca
// mismo, via CDI, en vez de devolver un stub.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class MiniFormAmbMapper {

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    public abstract MiniFormAmbDto toDto(MiniFormAmbEty ambiente);

    public MiniFormAmbEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return miniFormAmbRepository.findById(id)
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el ambiente " + id));
    }
}

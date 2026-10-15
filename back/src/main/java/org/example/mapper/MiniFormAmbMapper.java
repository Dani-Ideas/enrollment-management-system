package org.example.mapper;

import jakarta.inject.Inject;
import org.example.dto.MiniFormAmbDto;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.model.MiniFormAmbEty;
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

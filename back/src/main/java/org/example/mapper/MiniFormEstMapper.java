package org.example.mapper;

import jakarta.inject.Inject;
import org.example.dto.MiniFormEstDto;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.model.MiniFormEstEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// CDI permite inyectar en un Mapper igual que en cualquier otro bean -- desdeId() resuelve
// la FK ACA, contra la base, en vez de devolver un stub que el service tenga que resolver
// despues. InscripcionMapper.toEntity()/actualizarDesde()/toEntityConFormaciones() ya
// quedan con la entidad real lista para persistir.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class MiniFormEstMapper {

    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    public abstract MiniFormEstDto toDto(MiniFormEstEty estado);

    public MiniFormEstEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return miniFormEstRepository.findById(id)
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el estado " + id));
    }
}

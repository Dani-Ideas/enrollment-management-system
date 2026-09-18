package org.example.mapper;

import org.example.dto.MiniFormEstDto;
import org.example.model.MiniFormEst;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormEstMapper {

    MiniFormEstDto toDto(MiniFormEst estado);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormEst
    // "stub" (solo id) para que FormMapper.toEntity()/actualizarDesde() resuelvan
    // estadoId -> MiniFormEst sin tocar la base. FormServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormEst desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormEst estado = new MiniFormEst();
        estado.setId(id);
        return estado;
    }
}

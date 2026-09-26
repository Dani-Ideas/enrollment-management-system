package org.example.mapper;

import org.example.dto.MiniFormEstDto;
import org.example.model.MiniFormEstEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormEstMapper {

    MiniFormEstDto toDto(MiniFormEstEty estado);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormEstEty
    // "stub" (solo id) para que InscripcionMapper.toEntity()/actualizarDesde() resuelvan
    // estadoId -> MiniFormEstEty sin tocar la base. InscripcionServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormEstEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormEstEty estado = new MiniFormEstEty();
        estado.setId(id);
        return estado;
    }
}

package org.example.mapper;

import org.example.dto.MiniFormSisDto;
import org.example.model.MiniFormSis;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormSisMapper {

    MiniFormSisDto toDto(MiniFormSis sistema);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormSis
    // "stub" (solo id) para que FormMapper.toEntity()/actualizarDesde() resuelvan
    // sistemaId -> MiniFormSis sin tocar la base. FormServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormSis desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormSis sistema = new MiniFormSis();
        sistema.setId(id);
        return sistema;
    }
}

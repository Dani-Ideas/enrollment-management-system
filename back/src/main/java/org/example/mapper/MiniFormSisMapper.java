package org.example.mapper;

import org.example.dto.MiniFormSisDto;
import org.example.model.MiniFormSisEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormSisMapper {

    MiniFormSisDto toDto(MiniFormSisEty sistema);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormSisEty
    // "stub" (solo id) para que InscripcionMapper.toEntity()/actualizarDesde() resuelvan
    // sistemaId -> MiniFormSisEty sin tocar la base. InscripcionServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormSisEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormSisEty sistema = new MiniFormSisEty();
        sistema.setId(id);
        return sistema;
    }
}

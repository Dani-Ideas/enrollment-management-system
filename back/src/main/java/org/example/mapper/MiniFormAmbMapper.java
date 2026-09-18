package org.example.mapper;

import org.example.dto.MiniFormAmbDto;
import org.example.model.MiniFormAmb;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormAmbMapper {

    MiniFormAmbDto toDto(MiniFormAmb ambiente);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormAmb
    // "stub" (solo id) para que FormMapper.toEntity()/actualizarDesde() resuelvan
    // ambienteId -> MiniFormAmb sin tocar la base. FormServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormAmb desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormAmb ambiente = new MiniFormAmb();
        ambiente.setId(id);
        return ambiente;
    }
}

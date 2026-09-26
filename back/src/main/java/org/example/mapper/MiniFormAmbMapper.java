package org.example.mapper;

import org.example.dto.MiniFormAmbDto;
import org.example.model.MiniFormAmbEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormAmbMapper {

    MiniFormAmbDto toDto(MiniFormAmbEty ambiente);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormAmbEty
    // "stub" (solo id) para que InscripcionMapper.toEntity()/actualizarDesde() resuelvan
    // ambienteId -> MiniFormAmbEty sin tocar la base. InscripcionServiceImpl reemplaza este stub por
    // la entidad real antes de guardar.
    default MiniFormAmbEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormAmbEty ambiente = new MiniFormAmbEty();
        ambiente.setId(id);
        return ambiente;
    }
}

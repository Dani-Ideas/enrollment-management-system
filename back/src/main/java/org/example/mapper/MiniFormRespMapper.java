package org.example.mapper;

import org.example.dto.MiniFormRespDto;
import org.example.model.MiniFormRespEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormRespMapper {

    MiniFormRespDto toDto(MiniFormRespEty responsable);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormRespEty
    // "stub" (solo id). InscripcionEty usa MiniFormRespEty 3 veces con roles distintos
    // (jefeCarrera/Desarrollo/Inscripcion) -- este UNICO metodo Long->MiniFormRespEty
    // resuelve las 3 relaciones en InscripcionMapper, MapStruct no necesita uno por rol.
    default MiniFormRespEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormRespEty responsable = new MiniFormRespEty();
        responsable.setId(id);
        return responsable;
    }
}

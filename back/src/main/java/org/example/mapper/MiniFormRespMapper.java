package org.example.mapper;

import org.example.dto.MiniFormRespDto;
import org.example.model.MiniFormResp;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface MiniFormRespMapper {

    MiniFormRespDto toDto(MiniFormResp responsable);

    // Referencia por id: mismo patron que CarreraMapper.desdeId -- arma un MiniFormResp
    // "stub" (solo id). Form usa MiniFormResp 3 veces con roles distintos
    // (responsableProyecto/Desarrollo/Implantacion) -- este UNICO metodo Long->MiniFormResp
    // resuelve las 3 relaciones en FormMapper, MapStruct no necesita uno por rol.
    default MiniFormResp desdeId(Long id) {
        if (id == null) {
            return null;
        }
        MiniFormResp responsable = new MiniFormResp();
        responsable.setId(id);
        return responsable;
    }
}

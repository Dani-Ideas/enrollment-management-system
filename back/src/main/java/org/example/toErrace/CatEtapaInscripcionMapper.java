package org.example.toErrace;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface CatEtapaInscripcionMapper {

    CatEtapaInscripcionDto toDto(CatEtapaInscripcionEty entity);
}

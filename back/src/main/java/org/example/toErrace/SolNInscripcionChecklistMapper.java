package org.example.toErrace;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface SolNInscripcionChecklistMapper {

    @Mapping(target = "inscripcion", source = "idInscripcion.proyecto")
    @Mapping(target = "etapaInscripcion", source = "idEtapaInscripcion.nombre")
    @Mapping(target = "estado", source = "idEstado.estado")
    @Mapping(target = "responsable", source = "idResponsable.nombreLargo")
    SolNInscripcionChecklistDto toDto(SolNInscripcionChecklistEty entity);
}

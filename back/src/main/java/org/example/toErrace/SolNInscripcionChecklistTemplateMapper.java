package org.example.toErrace;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface SolNInscripcionChecklistTemplateMapper {

    @Mapping(target = "idTipoArquitectura", source = "id.idTipoArquitectura")
    @Mapping(target = "tipoArquitectura", source = "idTipoArquitectura.nombre")
    @Mapping(target = "nombre", source = "id.nombre")
    @Mapping(target = "orden", source = "id.orden")
    @Mapping(target = "etapaInscripcion", source = "idEtapaInscripcion.nombre")
    SolNInscripcionChecklistTemplateDto toDto(SolNInscripcionChecklistTemplateEty entity);
}

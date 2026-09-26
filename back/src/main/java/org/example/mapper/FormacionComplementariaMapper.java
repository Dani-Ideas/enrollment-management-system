package org.example.mapper;

import org.example.dto.FormacionComplementariaDto;
import org.example.dto.FormacionComplementariaRequestDto;
import org.example.model.InscripcionEty;
import org.example.model.FormacionComplementariaEty;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapper;

@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface FormacionComplementariaMapper
        extends RequestResponseMapper<FormacionComplementariaEty, FormacionComplementariaRequestDto, FormacionComplementariaDto> {

    // toDto(): "inscripcion.id" en vez de aplanar a texto (a diferencia de InscripcionMapper,
    // aqui no hay ningun campo legible que mostrar -- el FK apunta a la Inscripcion dueña,
    // no a un catalogo).
    @Override
    @Mapping(target = "inscripcionId", source = "inscripcion.id")
    FormacionComplementariaDto toDto(FormacionComplementariaEty entidad);

    // toEntity(): id lo genera la base; "inscripcion" llega como stub (solo id, via
    // desdeId() de abajo) a partir de inscripcionId -- igual que InscripcionMapper resuelve sus
    // 6 relaciones. A diferencia de InscripcionEty, aqui SI hace falta reemplazar el stub por la
    // InscripcionEty real antes de persistir (ver FormacionComplementariaServiceImpl.crear()) --
    // em.persist() de una entidad con una @ManyToOne apuntando a un stub desprendido (solo
    // id, nunca buscado/adjuntado) no es seguro con EclipseLink, mismo motivo por el que
    // InscripcionServiceImpl.resolverRelaciones() nunca persiste sus stubs tal cual.
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inscripcion", source = "inscripcionId")
    FormacionComplementariaEty toEntity(FormacionComplementariaRequestDto dto);

    // Mapeo de REFERENCIA: Long -> InscripcionEty "stub" (solo id) -- MapStruct lo encuentra solo
    // por tipo de retorno para el @Mapping de "inscripcion" de arriba (unica firma
    // Long -> InscripcionEty en este Mapper, no hace falta @Named/qualifiedByName).
    default InscripcionEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        InscripcionEty stub = new InscripcionEty();
        stub.setId(id);
        return stub;
    }
}

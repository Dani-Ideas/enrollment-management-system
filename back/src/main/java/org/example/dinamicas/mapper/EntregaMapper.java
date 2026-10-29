package org.example.dinamicas.mapper;

import jakarta.inject.Inject;
import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.RequestResponseMapper;
import org.example.dinamicas.dto.EntregaDto;
import org.example.dinamicas.dto.EntregaRequestDto;
import org.example.dinamicas.model.DireccionEty;
import org.example.dinamicas.model.DireccionId;
import org.example.dinamicas.model.EntregaEty;
import org.example.dinamicas.repository.DireccionRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

// Igual que PersonaMapper (abstract class + @Inject de Repository para resolver una FK a
// 422 si no existe), pero aca la FK ("direccion") no es un Long: son 3 ids del request que
// hay que combinar en un DireccionId antes de poder buscarla. MapStruct no sabe armar eso
// solo -- de ahi el metodo desdeIds() de abajo, enganchado via @Mapping(expression=...).
@Mapper(componentModel = MappingConstants.ComponentModel.CDI, uses = {DireccionMapper.class})
public abstract class EntregaMapper implements RequestResponseMapper<EntregaEty, EntregaRequestDto, EntregaDto> {

    @Inject
    private DireccionRepository direccionRepository;

    @Override
    @Mapping(target = "direccion", source = "direccion")
    public abstract EntregaDto toDto(EntregaEty entrega);

    @Override
    @Mapping(target = "direccion", expression = "java(desdeIds(dto.personaId(), dto.coloniaId(), dto.tipoId()))")
    public abstract EntregaEty toEntity(EntregaRequestDto dto);

    public DireccionEty desdeIds(Long personaId, Long coloniaId, Long tipoId) {
        DireccionId id = new DireccionId(personaId, coloniaId, tipoId);
        return direccionRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException(
                        "No existe la dirección (persona=" + personaId + ", colonia=" + coloniaId + ", tipo=" + tipoId + ")"));
    }
}

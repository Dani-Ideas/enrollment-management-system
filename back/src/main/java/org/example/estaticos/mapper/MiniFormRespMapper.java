package org.example.estaticos.mapper;

import jakarta.inject.Inject;
import org.example.estaticos.dto.MiniFormRespDto;
import org.example.estaticos.lib.MiniFormRespRepository;
import org.example.comun.ReferenciaInvalidaException;
import org.example.estaticos.model.MiniFormRespEty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

// Ver MiniFormEstMapper -- mismo criterio: desdeId() resuelve la FK contra la base aca
// mismo, via CDI. InscripcionEty usa MiniFormRespEty 3 veces con roles distintos
// (jefeCarrera/maestro/carrera) -- este UNICO metodo Long->MiniFormRespEty resuelve las 3
// relaciones en InscripcionMapper, no hace falta uno por rol.
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public abstract class MiniFormRespMapper {

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    public abstract MiniFormRespDto toDto(MiniFormRespEty responsable);

    public MiniFormRespEty desdeId(Long id) {
        if (id == null) {
            return null;
        }
        return miniFormRespRepository.findById(id)
                .orElseThrow(() -> new ReferenciaInvalidaException("No existe el responsable " + id));
    }
}

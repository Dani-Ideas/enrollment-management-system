package org.example.estaticos.lib;

import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.TipoDireccionDto;

import java.util.List;

public interface CatalogoGeograficoService {

    List<PaisDto> listarPaises();

    List<EstadoDto> listarEstados(Long paisId);

    List<MunicipioDto> listarMunicipios(Long estadoId);

    List<ColoniaDto> listarColonias(Long municipioId);

    List<TipoDireccionDto> listarTiposDireccion();
}

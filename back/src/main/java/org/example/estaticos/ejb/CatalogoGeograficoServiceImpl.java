package org.example.estaticos.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.TipoDireccionDto;
import org.example.estaticos.lib.CatalogoGeograficoService;
import org.example.estaticos.lib.ColoniaRepository;
import org.example.estaticos.lib.EstadoRepository;
import org.example.estaticos.lib.MunicipioRepository;
import org.example.estaticos.lib.PaisRepository;
import org.example.estaticos.lib.TipoDireccionRepository;
import org.example.estaticos.mapper.CatalogoGeograficoMapper;

import java.util.List;

// Sin cache (a diferencia de ServiceArtifax): colonia puede tener decenas de miles de
// filas, se lee filtrada por su padre.
@Stateless
public class CatalogoGeograficoServiceImpl implements CatalogoGeograficoService {

    @Inject
    private PaisRepository paisRepository;
    @Inject
    private EstadoRepository estadoRepository;
    @Inject
    private MunicipioRepository municipioRepository;
    @Inject
    private ColoniaRepository coloniaRepository;
    @Inject
    private TipoDireccionRepository tipoDireccionRepository;

    @Inject
    private CatalogoGeograficoMapper mapper;

    @Override
    public List<PaisDto> listarPaises() {
        return mapper.paisesToDto(paisRepository.findAll().toList());
    }

    @Override
    public List<EstadoDto> listarEstados(Long paisId) {
        return mapper.estadosToDto(estadoRepository.porPais(paisId));
    }

    @Override
    public List<MunicipioDto> listarMunicipios(Long estadoId) {
        return mapper.municipiosToDto(municipioRepository.porEstado(estadoId));
    }

    @Override
    public List<ColoniaDto> listarColonias(Long municipioId) {
        return mapper.coloniasToDto(coloniaRepository.porMunicipio(municipioId));
    }

    @Override
    public List<TipoDireccionDto> listarTiposDireccion() {
        return mapper.tiposToDto(tipoDireccionRepository.findAll().toList());
    }
}

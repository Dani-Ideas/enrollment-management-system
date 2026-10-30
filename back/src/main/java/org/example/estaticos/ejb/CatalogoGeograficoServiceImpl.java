package org.example.estaticos.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.estaticos.dto.ColoniaDto;
import org.example.estaticos.dto.EstadoDto;
import org.example.estaticos.dto.MunicipioDto;
import org.example.estaticos.dto.PaisDto;
import org.example.estaticos.dto.TipoDireccionDto;
import org.example.estaticos.service.CatalogoGeograficoService;
import org.example.estaticos.repository.ColoniaRepository;
import org.example.estaticos.repository.EstadoRepository;
import org.example.estaticos.repository.MunicipioRepository;
import org.example.estaticos.repository.PaisRepository;
import org.example.estaticos.repository.TipoDireccionRepository;
import org.example.estaticos.mapper.ColoniaMapper;
import org.example.estaticos.mapper.EstadoMapper;
import org.example.estaticos.mapper.MunicipioMapper;
import org.example.estaticos.mapper.PaisMapper;
import org.example.estaticos.mapper.TipoDireccionMapper;

import java.util.List;

// Sin cache (a diferencia de CatalogoInscripcionCache): colonia puede tener decenas de miles de
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
    private PaisMapper paisMapper;
    @Inject
    private EstadoMapper estadoMapper;
    @Inject
    private MunicipioMapper municipioMapper;
    @Inject
    private ColoniaMapper coloniaMapper;
    @Inject
    private TipoDireccionMapper tipoDireccionMapper;

    @Override
    public List<PaisDto> listarPaises() {
        return paisMapper.toDto(paisRepository.findAll().toList());
    }

    @Override
    public List<EstadoDto> listarEstados(Long paisId) {
        return estadoMapper.toDto(estadoRepository.porPais(paisId));
    }

    @Override
    public List<MunicipioDto> listarMunicipios(Long estadoId) {
        return municipioMapper.toDto(municipioRepository.porEstado(estadoId));
    }

    @Override
    public List<ColoniaDto> listarColonias(Long municipioId) {
        return coloniaMapper.toDto(coloniaRepository.porMunicipio(municipioId));
    }

    @Override
    public List<TipoDireccionDto> listarTiposDireccion() {
        return tipoDireccionMapper.toDto(tipoDireccionRepository.findAll().toList());
    }
}

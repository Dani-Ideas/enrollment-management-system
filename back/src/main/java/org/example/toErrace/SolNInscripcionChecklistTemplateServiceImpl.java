package org.example.toErrace;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class SolNInscripcionChecklistTemplateServiceImpl implements SolNInscripcionChecklistTemplateService {

    @Inject
    private SolNInscripcionChecklistTemplateRepository solNInscripcionChecklistTemplateRepository;

    @Inject
    private SolNInscripcionChecklistTemplateMapper solNInscripcionChecklistTemplateMapper;

    @Override
    public List<SolNInscripcionChecklistTemplateDto> listar() {
        return solNInscripcionChecklistTemplateRepository.findAll()
                .map(solNInscripcionChecklistTemplateMapper::toDto)
                .toList();
    }

    @Override
    public SolNInscripcionChecklistTemplateDto buscarPorId(Integer idTipoArquitectura, String nombre, Integer orden) {
        SolNInscripcionChecklistTemplateId id = new SolNInscripcionChecklistTemplateId();
        id.setIdTipoArquitectura(idTipoArquitectura);
        id.setNombre(nombre);
        id.setOrden(orden);
        return solNInscripcionChecklistTemplateRepository.findById(id)
                .map(solNInscripcionChecklistTemplateMapper::toDto)
                .orElse(null);
    }
}

package org.example.toErrace;

import java.util.List;

public interface SolNInscripcionChecklistTemplateService {

    List<SolNInscripcionChecklistTemplateDto> listar();

    SolNInscripcionChecklistTemplateDto buscarPorId(Integer idTipoArquitectura, String nombre, Integer orden);
}

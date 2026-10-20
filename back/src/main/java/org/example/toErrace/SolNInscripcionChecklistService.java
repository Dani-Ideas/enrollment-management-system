package org.example.toErrace;

import java.util.List;

public interface SolNInscripcionChecklistService {

    List<SolNInscripcionChecklistDto> listar();

    SolNInscripcionChecklistDto buscarPorId(Integer id);
}

package org.example.dinamicas.service;

import org.example.dinamicas.dto.InscripcionConFormacionComplementariaDto;
import org.example.dinamicas.dto.InscripcionConFormacionComplementariaRequestDto;
import org.example.dinamicas.dto.InscripcionDto;

import java.util.List;

public interface InscripcionService {
    List<InscripcionDto> listar();
    // Heredado de CrudServiceBase -- ya no lo usa el Controller (ver buscarConFormaciones),
    // pero lo prueba InscripcionServiceImplTest.buscarPorIdInexistenteLanza404.
    InscripcionDto buscarPorId(Long id);
    // Lo que SI usa el Controller en el GET/{id}: la Inscripcion + sus formaciones, para que
    // el front pueda editar sin perderlas (el PUT manda la lista COMPLETA que debe quedar).
    InscripcionConFormacionComplementariaDto buscarConFormaciones(Long id);
    InscripcionConFormacionComplementariaDto actualizar(Long id, InscripcionConFormacionComplementariaRequestDto datosActualizados);
    InscripcionConFormacionComplementariaDto crear(InscripcionConFormacionComplementariaRequestDto dto);
}
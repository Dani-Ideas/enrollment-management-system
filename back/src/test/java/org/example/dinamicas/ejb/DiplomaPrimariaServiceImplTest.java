package org.example.dinamicas.ejb;

import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.DiplomaPrimariaRequestDto;
import org.example.dinamicas.mapper.DiplomaPrimariaMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.dinamicas.repository.DiplomaPrimariaRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Prueba unitaria: repositorios y mapper simulados, sin GlassFish ni base. Cubre crear()
// (inscripcion inexistente, diploma duplicado) y el calculo de "emitido"/"fechaEmision".
@ExtendWith(MockitoExtension.class)
class DiplomaPrimariaServiceImplTest {

    @Mock
    private DiplomaPrimariaRepository diplomaPrimariaRepository;
    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private DiplomaPrimariaMapper diplomaPrimariaMapper;

    @InjectMocks
    private DiplomaPrimariaServiceImpl service;

    @Captor
    private ArgumentCaptor<DiplomaPrimariaEty> diplomaCaptor;

    @Test
    void crearConInscripcionInexistenteLanza422() {
        when(inscripcionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ReferenciaInvalidaException.class,
                () -> service.crear(peticionTodasFalse(99L)));
    }

    @Test
    void crearDuplicadoParaMismaInscripcionLanza409() {
        InscripcionEty inscripcion = inscripcion(10L);
        inscripcion.setDiplomaPrimaria(new DiplomaPrimariaEty());
        when(inscripcionRepository.findById(10L)).thenReturn(Optional.of(inscripcion));

        assertThrows(ReglaDeNegocioException.class,
                () -> service.crear(peticionTodasFalse(10L)));
        verify(diplomaPrimariaRepository, never()).insert(any());
    }

    @Test
    void crearConTodasLasFirmasVerdaderasMarcaEmitidoYFechaEmision() {
        InscripcionEty inscripcion = inscripcion(10L);
        when(inscripcionRepository.findById(10L)).thenReturn(Optional.of(inscripcion));
        when(diplomaPrimariaMapper.toEntity(any())).thenReturn(new DiplomaPrimariaEty());
        when(diplomaPrimariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion(10L, true, true, true, true, true, true, true));

        verify(diplomaPrimariaRepository).insert(diplomaCaptor.capture());
        DiplomaPrimariaEty guardado = diplomaCaptor.getValue();
        assertTrue(guardado.isEmitido());
        assertNotNull(guardado.getFechaEmision());
        assertSame(inscripcion, guardado.getInscripcion());
    }

    @Test
    void crearConUnaFirmaFaltanteNoMarcaEmitido() {
        InscripcionEty inscripcion = inscripcion(10L);
        when(inscripcionRepository.findById(10L)).thenReturn(Optional.of(inscripcion));
        when(diplomaPrimariaMapper.toEntity(any())).thenReturn(new DiplomaPrimariaEty());
        when(diplomaPrimariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion(10L, true, true, true, true, true, true, false));

        verify(diplomaPrimariaRepository).insert(diplomaCaptor.capture());
        DiplomaPrimariaEty guardado = diplomaCaptor.getValue();
        assertFalse(guardado.isEmitido());
        assertNull(guardado.getFechaEmision());
    }

    @Test
    void actualizarQuitaEmitidoSiUnaFirmaVuelveAFalso() {
        DiplomaPrimariaEty existente = new DiplomaPrimariaEty();
        existente.setId(1L);
        existente.setFirmaMaestro1ro(true);
        existente.setFirmaMaestro2do(true);
        existente.setFirmaMaestro3ro(true);
        existente.setFirmaMaestro4to(true);
        existente.setFirmaMaestro5to(true);
        existente.setFirmaMaestro6to(true);
        existente.setFirmaDirectorPrimaria(true);
        existente.setEmitido(true);
        existente.setFechaEmision(LocalDateTime.now().minusDays(1));

        when(diplomaPrimariaRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(diplomaPrimariaRepository.update(existente)).thenReturn(existente);
        // El mapper real (MapStruct) aplicaria el dto a la entidad; como aca esta simulado,
        // se replica ese efecto a mano -- es lo unico que importa para probar el recalculo.
        doAnswer(inv -> {
            existente.setFirmaMaestro6to(false);
            return null;
        }).when(diplomaPrimariaMapper).actualizarDesde(existente, peticion(10L, true, true, true, true, true, false, true));

        service.actualizar(1L, peticion(10L, true, true, true, true, true, false, true));

        assertFalse(existente.isEmitido());
        assertNull(existente.getFechaEmision());
    }

    // --- Helpers ---

    private static InscripcionEty inscripcion(Long id) {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(id);
        return inscripcion;
    }

    private static DiplomaPrimariaRequestDto peticionTodasFalse(Long inscripcionId) {
        return peticion(inscripcionId, false, false, false, false, false, false, false);
    }

    private static DiplomaPrimariaRequestDto peticion(
            Long inscripcionId,
            boolean f1, boolean f2, boolean f3, boolean f4, boolean f5, boolean f6, boolean director) {
        return new DiplomaPrimariaRequestDto(inscripcionId, f1, f2, f3, f4, f5, f6, director);
    }
}

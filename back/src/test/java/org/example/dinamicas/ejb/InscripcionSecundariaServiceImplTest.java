package org.example.dinamicas.ejb;

import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.DiplomaSecundariaRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaRequestDto;
import org.example.dinamicas.mapper.DiplomaSecundariaMapper;
import org.example.dinamicas.mapper.InscripcionSecundariaMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.example.dinamicas.repository.InscripcionSecundariaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// Prueba unitaria: repositorios y mappers simulados, sin GlassFish ni base. Cubre la regla de
// negocio central de la cadena: no se puede crear/actualizar una InscripcionSecundaria si el
// DiplomaPrimaria referenciado no esta completo, y que la validacion corre ANTES de insertar
// la fila padre (no debe quedar ninguna huerfana).
@ExtendWith(MockitoExtension.class)
class InscripcionSecundariaServiceImplTest {

    @Mock
    private InscripcionSecundariaRepository inscripcionSecundariaRepository;
    @Mock
    private DiplomaSecundariaRepository diplomaSecundariaRepository;
    @Mock
    private InscripcionSecundariaMapper inscripcionSecundariaMapper;
    @Mock
    private DiplomaSecundariaMapper diplomaSecundariaMapper;

    @InjectMocks
    private InscripcionSecundariaServiceImpl service;

    @Captor
    private ArgumentCaptor<DiplomaSecundariaEty> diplomaCaptor;

    @Test
    void crearConDiplomaPrimariaCompletaCreaInscripcionYDiploma() {
        DiplomaSecundariaEty nuevoDiploma = new DiplomaSecundariaEty();
        nuevoDiploma.setDiplomaPrimaria(diplomaPrimariaCompleto());
        when(diplomaSecundariaMapper.toEntity(any())).thenReturn(nuevoDiploma);

        InscripcionSecundariaEty creada = new InscripcionSecundariaEty();
        creada.setId(20L);
        when(inscripcionSecundariaMapper.toEntity(any())).thenReturn(new InscripcionSecundariaEty());
        when(inscripcionSecundariaRepository.insert(any())).thenReturn(creada);
        when(diplomaSecundariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion(1L));

        verify(inscripcionSecundariaRepository).insert(any());
        verify(diplomaSecundariaRepository).insert(diplomaCaptor.capture());
        assertSame(creada, diplomaCaptor.getValue().getInscripcionSecundaria());
    }

    @Test
    void crearConDiplomaPrimariaIncompletaLanza409YNoInsertaNada() {
        DiplomaSecundariaEty nuevoDiploma = new DiplomaSecundariaEty();
        nuevoDiploma.setDiplomaPrimaria(diplomaPrimariaIncompleto());
        when(diplomaSecundariaMapper.toEntity(any())).thenReturn(nuevoDiploma);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(peticion(1L)));

        verifyNoInteractions(inscripcionSecundariaRepository);
        verify(diplomaSecundariaRepository, never()).insert(any());
    }

    @Test
    void actualizarConDiplomaPrimariaIncompletaLanza409() {
        InscripcionSecundariaEty existente = new InscripcionSecundariaEty();
        existente.setId(10L);
        DiplomaSecundariaEty diploma = new DiplomaSecundariaEty();
        diploma.setDiplomaPrimaria(diplomaPrimariaIncompleto());
        existente.setDiplomaSecundaria(diploma);

        when(inscripcionSecundariaRepository.findById(10L)).thenReturn(Optional.of(existente));

        assertThrows(ReglaDeNegocioException.class, () -> service.actualizar(10L, peticion(1L)));

        verify(inscripcionSecundariaRepository, never()).update(any());
        verify(diplomaSecundariaRepository, never()).update(any());
    }

    @Test
    void actualizarInexistenteLanza404YNoGuardaNada() {
        when(inscripcionSecundariaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.actualizar(99L, peticion(1L)));

        verify(inscripcionSecundariaRepository, never()).update(any());
        verifyNoInteractions(diplomaSecundariaRepository);
    }

    // --- Helpers ---

    private static DiplomaPrimariaEty diplomaPrimariaCompleto() {
        DiplomaPrimariaEty diploma = new DiplomaPrimariaEty();
        diploma.setId(1L);
        diploma.setFirmaMaestro1ro(true);
        diploma.setFirmaMaestro2do(true);
        diploma.setFirmaMaestro3ro(true);
        diploma.setFirmaMaestro4to(true);
        diploma.setFirmaMaestro5to(true);
        diploma.setFirmaMaestro6to(true);
        diploma.setFirmaDirectorPrimaria(true);
        diploma.setEmitido(true);
        return diploma;
    }

    private static DiplomaPrimariaEty diplomaPrimariaIncompleto() {
        DiplomaPrimariaEty diploma = diplomaPrimariaCompleto();
        diploma.setFirmaMaestro6to(false);
        diploma.setEmitido(false);
        return diploma;
    }

    private static InscripcionSecundariaConDiplomaRequestDto peticion(Long diplomaPrimariaId) {
        InscripcionSecundariaRequestDto inscripcion = new InscripcionSecundariaRequestDto(
                1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, java.time.LocalDateTime.now(), null);
        DiplomaSecundariaRequestDto diploma = new DiplomaSecundariaRequestDto(
                diplomaPrimariaId, false, false, false, false, false);
        return new InscripcionSecundariaConDiplomaRequestDto(inscripcion, diploma);
    }
}

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
import org.example.dinamicas.model.InscripcionSecundariaId;
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
// negocio central de la cadena -- ahora resuelta por inscripcionSecundariaMapper.toEntity()
// (ya no por diplomaSecundariaMapper: la PK compartida vive en InscripcionSecundariaEty) -- y
// que la validacion corre ANTES de insertar la fila padre (no debe quedar ninguna huerfana).
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
        InscripcionSecundariaEty nuevaInscripcion = new InscripcionSecundariaEty();
        nuevaInscripcion.setDiplomaPrimaria(diplomaPrimariaCompleto());
        when(inscripcionSecundariaMapper.toEntity(any(InscripcionSecundariaRequestDto.class))).thenReturn(nuevaInscripcion);

        InscripcionSecundariaEty creada = nuevaInscripcion;
        when(inscripcionSecundariaRepository.insert(any())).thenReturn(creada);
        when(diplomaSecundariaMapper.toEntity(any(DiplomaSecundariaRequestDto.class))).thenReturn(new DiplomaSecundariaEty());
        when(diplomaSecundariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion());

        verify(inscripcionSecundariaRepository).insert(any());
        verify(diplomaSecundariaRepository).insert(diplomaCaptor.capture());
        assertSame(creada, diplomaCaptor.getValue().getInscripcionSecundaria());
    }

    @Test
    void crearConDiplomaPrimariaIncompletaLanza409YNoInsertaNada() {
        InscripcionSecundariaEty nuevaInscripcion = new InscripcionSecundariaEty();
        nuevaInscripcion.setDiplomaPrimaria(diplomaPrimariaIncompleto());
        when(inscripcionSecundariaMapper.toEntity(any(InscripcionSecundariaRequestDto.class))).thenReturn(nuevaInscripcion);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(peticion()));

        verify(inscripcionSecundariaRepository, never()).insert(any());
        verifyNoInteractions(diplomaSecundariaRepository);
    }

    @Test
    void actualizarConDiplomaPrimariaIncompletaLanza409() {
        InscripcionSecundariaEty existente = new InscripcionSecundariaEty();
        existente.setDiplomaPrimaria(diplomaPrimariaIncompleto());

        when(inscripcionSecundariaRepository.findById(new InscripcionSecundariaId(10L))).thenReturn(Optional.of(existente));

        assertThrows(ReglaDeNegocioException.class, () -> service.actualizar(10L, peticion()));

        verify(inscripcionSecundariaRepository, never()).update(any());
        verifyNoInteractions(diplomaSecundariaRepository);
    }

    @Test
    void actualizarInexistenteLanza404YNoGuardaNada() {
        when(inscripcionSecundariaRepository.findById(new InscripcionSecundariaId(99L))).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.actualizar(99L, peticion()));

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

    private static InscripcionSecundariaConDiplomaRequestDto peticion() {
        InscripcionSecundariaRequestDto inscripcion = new InscripcionSecundariaRequestDto(
                1L, 1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, java.time.LocalDateTime.now(), null);
        DiplomaSecundariaRequestDto diploma = new DiplomaSecundariaRequestDto(false, false, false, false, false);
        return new InscripcionSecundariaConDiplomaRequestDto(inscripcion, diploma);
    }
}

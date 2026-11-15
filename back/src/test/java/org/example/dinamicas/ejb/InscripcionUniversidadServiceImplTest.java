package org.example.dinamicas.ejb;

import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.DiplomaUniversidadRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadRequestDto;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaSecundariaId;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionSecundariaId;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.model.InscripcionUniversidadId;
import org.example.dinamicas.repository.DiplomaUniversidadRepository;
import org.example.dinamicas.repository.InscripcionUniversidadRepository;
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

// Mismo patron que InscripcionSecundariaServiceImplTest, un nivel arriba: la regla de negocio
// valida contra DiplomaSecundariaEty, resuelto por inscripcionUniversidadMapper.toEntity().
@ExtendWith(MockitoExtension.class)
class InscripcionUniversidadServiceImplTest {

    @Mock
    private InscripcionUniversidadRepository inscripcionUniversidadRepository;
    @Mock
    private DiplomaUniversidadRepository diplomaUniversidadRepository;
    @Mock
    private InscripcionUniversidadMapper inscripcionUniversidadMapper;
    @Mock
    private DiplomaUniversidadMapper diplomaUniversidadMapper;

    @InjectMocks
    private InscripcionUniversidadServiceImpl service;

    @Captor
    private ArgumentCaptor<DiplomaUniversidadEty> diplomaCaptor;

    @Test
    void crearConDiplomaSecundariaCompletaCreaInscripcionYDiploma() {
        InscripcionUniversidadEty nuevaInscripcion = new InscripcionUniversidadEty();
        nuevaInscripcion.setDiplomaSecundaria(diplomaSecundariaCompleto());
        when(inscripcionUniversidadMapper.toEntity(any())).thenReturn(nuevaInscripcion);

        InscripcionUniversidadEty creada = nuevaInscripcion;
        when(inscripcionUniversidadRepository.insert(any())).thenReturn(creada);
        when(diplomaUniversidadMapper.toEntity(any())).thenReturn(new DiplomaUniversidadEty());
        when(diplomaUniversidadRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion());

        verify(inscripcionUniversidadRepository).insert(any());
        verify(diplomaUniversidadRepository).insert(diplomaCaptor.capture());
        assertSame(creada, diplomaCaptor.getValue().getInscripcionUniversidad());
    }

    @Test
    void crearConDiplomaSecundariaIncompletaLanza409YNoInsertaNada() {
        InscripcionUniversidadEty nuevaInscripcion = new InscripcionUniversidadEty();
        nuevaInscripcion.setDiplomaSecundaria(diplomaSecundariaIncompleto());
        when(inscripcionUniversidadMapper.toEntity(any())).thenReturn(nuevaInscripcion);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(peticion()));

        verify(inscripcionUniversidadRepository, never()).insert(any());
        verifyNoInteractions(diplomaUniversidadRepository);
    }

    @Test
    void actualizarConDiplomaSecundariaIncompletaLanza409() {
        InscripcionUniversidadEty existente = new InscripcionUniversidadEty();
        existente.setDiplomaSecundaria(diplomaSecundariaIncompleto());

        InscripcionUniversidadId id = new InscripcionUniversidadId(new DiplomaSecundariaId(new InscripcionSecundariaId(10L)));
        when(inscripcionUniversidadRepository.findById(id)).thenReturn(Optional.of(existente));

        assertThrows(ReglaDeNegocioException.class, () -> service.actualizar(10L, peticion()));

        verify(inscripcionUniversidadRepository, never()).update(any());
        verifyNoInteractions(diplomaUniversidadRepository);
    }

    @Test
    void actualizarInexistenteLanza404YNoGuardaNada() {
        InscripcionUniversidadId id = new InscripcionUniversidadId(new DiplomaSecundariaId(new InscripcionSecundariaId(99L)));
        when(inscripcionUniversidadRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.actualizar(99L, peticion()));

        verify(inscripcionUniversidadRepository, never()).update(any());
        verifyNoInteractions(diplomaUniversidadRepository);
    }

    // --- Helpers ---

    private static DiplomaSecundariaEty diplomaSecundariaCompleto() {
        DiplomaSecundariaEty diploma = new DiplomaSecundariaEty();
        diploma.setFirmaMaestroPrimerGrado(true);
        diploma.setFirmaMaestroSegundoGrado(true);
        diploma.setFirmaMaestroTercerGrado(true);
        diploma.setFirmaOrientador(true);
        diploma.setFirmaDirectorSecundaria(true);
        diploma.setEmitido(true);
        return diploma;
    }

    private static DiplomaSecundariaEty diplomaSecundariaIncompleto() {
        DiplomaSecundariaEty diploma = diplomaSecundariaCompleto();
        diploma.setFirmaOrientador(false);
        diploma.setEmitido(false);
        return diploma;
    }

    private static InscripcionUniversidadConDiplomaRequestDto peticion() {
        InscripcionUniversidadRequestDto inscripcion = new InscripcionUniversidadRequestDto(
                1L, 1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, java.time.LocalDateTime.now(), null);
        DiplomaUniversidadRequestDto diploma = new DiplomaUniversidadRequestDto(false, false, false, false);
        return new InscripcionUniversidadConDiplomaRequestDto(inscripcion, diploma);
    }
}

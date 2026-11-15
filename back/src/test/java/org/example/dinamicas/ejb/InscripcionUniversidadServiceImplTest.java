package org.example.dinamicas.ejb;

import org.example.comun.RecursoNoEncontradoException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.DiplomaUniversidadRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadConDiplomaRequestDto;
import org.example.dinamicas.dto.InscripcionUniversidadRequestDto;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionUniversidadEty;
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
// valida contra DiplomaSecundariaEty en vez de DiplomaPrimariaEty.
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
        DiplomaUniversidadEty nuevoDiploma = new DiplomaUniversidadEty();
        nuevoDiploma.setDiplomaSecundaria(diplomaSecundariaCompleto());
        when(diplomaUniversidadMapper.toEntity(any())).thenReturn(nuevoDiploma);

        InscripcionUniversidadEty creada = new InscripcionUniversidadEty();
        creada.setId(30L);
        when(inscripcionUniversidadMapper.toEntity(any())).thenReturn(new InscripcionUniversidadEty());
        when(inscripcionUniversidadRepository.insert(any())).thenReturn(creada);
        when(diplomaUniversidadRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        service.crear(peticion(1L));

        verify(inscripcionUniversidadRepository).insert(any());
        verify(diplomaUniversidadRepository).insert(diplomaCaptor.capture());
        assertSame(creada, diplomaCaptor.getValue().getInscripcionUniversidad());
    }

    @Test
    void crearConDiplomaSecundariaIncompletaLanza409YNoInsertaNada() {
        DiplomaUniversidadEty nuevoDiploma = new DiplomaUniversidadEty();
        nuevoDiploma.setDiplomaSecundaria(diplomaSecundariaIncompleto());
        when(diplomaUniversidadMapper.toEntity(any())).thenReturn(nuevoDiploma);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(peticion(1L)));

        verifyNoInteractions(inscripcionUniversidadRepository);
        verify(diplomaUniversidadRepository, never()).insert(any());
    }

    @Test
    void actualizarConDiplomaSecundariaIncompletaLanza409() {
        InscripcionUniversidadEty existente = new InscripcionUniversidadEty();
        existente.setId(10L);
        DiplomaUniversidadEty diploma = new DiplomaUniversidadEty();
        diploma.setDiplomaSecundaria(diplomaSecundariaIncompleto());
        existente.setDiplomaUniversidad(diploma);

        when(inscripcionUniversidadRepository.findById(10L)).thenReturn(Optional.of(existente));

        assertThrows(ReglaDeNegocioException.class, () -> service.actualizar(10L, peticion(1L)));

        verify(inscripcionUniversidadRepository, never()).update(any());
        verify(diplomaUniversidadRepository, never()).update(any());
    }

    @Test
    void actualizarInexistenteLanza404YNoGuardaNada() {
        when(inscripcionUniversidadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.actualizar(99L, peticion(1L)));

        verify(inscripcionUniversidadRepository, never()).update(any());
        verifyNoInteractions(diplomaUniversidadRepository);
    }

    // --- Helpers ---

    private static DiplomaSecundariaEty diplomaSecundariaCompleto() {
        DiplomaSecundariaEty diploma = new DiplomaSecundariaEty();
        diploma.setId(1L);
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

    private static InscripcionUniversidadConDiplomaRequestDto peticion(Long diplomaSecundariaId) {
        InscripcionUniversidadRequestDto inscripcion = new InscripcionUniversidadRequestDto(
                1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, java.time.LocalDateTime.now(), null);
        DiplomaUniversidadRequestDto diploma = new DiplomaUniversidadRequestDto(
                diplomaSecundariaId, false, false, false, false);
        return new InscripcionUniversidadConDiplomaRequestDto(inscripcion, diploma);
    }
}

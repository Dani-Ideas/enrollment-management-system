package org.example.dinamicas.ejb;

import org.example.comun.ReferenciaInvalidaException;
import org.example.comun.ReglaDeNegocioException;
import org.example.dinamicas.dto.CadenaDiplomasRequestDto;
import org.example.dinamicas.dto.DiplomaPrimariaDatosDto;
import org.example.dinamicas.dto.DiplomaSecundariaRequestDto;
import org.example.dinamicas.dto.DiplomaUniversidadRequestDto;
import org.example.dinamicas.dto.InscripcionSecundariaDatosDto;
import org.example.dinamicas.dto.InscripcionUniversidadDatosDto;
import org.example.dinamicas.mapper.DiplomaPrimariaMapper;
import org.example.dinamicas.mapper.DiplomaSecundariaMapper;
import org.example.dinamicas.mapper.DiplomaUniversidadMapper;
import org.example.dinamicas.mapper.InscripcionSecundariaMapper;
import org.example.dinamicas.mapper.InscripcionUniversidadMapper;
import org.example.dinamicas.model.DiplomaPrimariaEty;
import org.example.dinamicas.model.DiplomaSecundariaEty;
import org.example.dinamicas.model.DiplomaUniversidadEty;
import org.example.dinamicas.model.InscripcionEty;
import org.example.dinamicas.model.InscripcionSecundariaEty;
import org.example.dinamicas.model.InscripcionUniversidadEty;
import org.example.dinamicas.repository.DiplomaPrimariaRepository;
import org.example.dinamicas.repository.DiplomaSecundariaRepository;
import org.example.dinamicas.repository.DiplomaUniversidadRepository;
import org.example.dinamicas.repository.InscripcionRepository;
import org.example.dinamicas.repository.InscripcionSecundariaRepository;
import org.example.dinamicas.repository.InscripcionUniversidadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// Prueba unitaria: repositorios y mappers simulados, sin GlassFish ni base. Cubre la cadena
// opcional-pero-acumulativa: cada nivel solo se intenta si el anterior vino en la MISMA
// peticion y (cuando corresponde) esta completo -- y que un corte a mitad de camino no
// inserta nada de lo que vendria despues.
@ExtendWith(MockitoExtension.class)
class CadenaDiplomasServiceImplTest {

    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private DiplomaPrimariaRepository diplomaPrimariaRepository;
    @Mock
    private InscripcionSecundariaRepository inscripcionSecundariaRepository;
    @Mock
    private DiplomaSecundariaRepository diplomaSecundariaRepository;
    @Mock
    private InscripcionUniversidadRepository inscripcionUniversidadRepository;
    @Mock
    private DiplomaUniversidadRepository diplomaUniversidadRepository;

    @Mock
    private DiplomaPrimariaMapper diplomaPrimariaMapper;
    @Mock
    private InscripcionSecundariaMapper inscripcionSecundariaMapper;
    @Mock
    private DiplomaSecundariaMapper diplomaSecundariaMapper;
    @Mock
    private InscripcionUniversidadMapper inscripcionUniversidadMapper;
    @Mock
    private DiplomaUniversidadMapper diplomaUniversidadMapper;

    @InjectMocks
    private CadenaDiplomasServiceImpl service;

    @Test
    void inscripcionInexistenteLanza422() {
        when(inscripcionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ReferenciaInvalidaException.class,
                () -> service.crear(99L, peticionSoloDiplomaPrimaria(true)));
    }

    @Test
    void diplomaPrimariaDuplicadoLanza409() {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(1L);
        inscripcion.setDiplomaPrimaria(new DiplomaPrimariaEty());
        when(inscripcionRepository.findById(1L)).thenReturn(Optional.of(inscripcion));

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(1L, peticionSoloDiplomaPrimaria(true)));
        verifyNoInteractions(diplomaPrimariaRepository);
    }

    @Test
    void soloDiplomaPrimariaCreaSoloEso() {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(1L);
        when(inscripcionRepository.findById(1L)).thenReturn(Optional.of(inscripcion));
        when(diplomaPrimariaMapper.toEntity(any(DiplomaPrimariaDatosDto.class))).thenReturn(new DiplomaPrimariaEty());
        when(diplomaPrimariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        var resultado = service.crear(1L, peticionSoloDiplomaPrimaria(true));

        verify(diplomaPrimariaRepository).insert(any());
        verifyNoInteractions(inscripcionSecundariaRepository);
        assertNotNull(resultado);
    }

    @Test
    void inscripcionSecundariaSinDiplomaPrimariaLanza409() {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(1L);
        when(inscripcionRepository.findById(1L)).thenReturn(Optional.of(inscripcion));

        CadenaDiplomasRequestDto dto = new CadenaDiplomasRequestDto(
                null, inscripcionSecundariaDatos(), null, null, null);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(1L, dto));
        verifyNoInteractions(inscripcionSecundariaRepository);
    }

    @Test
    void diplomaPrimariaIncompletaBloqueaInscripcionSecundariaYNoInsertaNada() {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(1L);
        when(inscripcionRepository.findById(1L)).thenReturn(Optional.of(inscripcion));
        when(diplomaPrimariaMapper.toEntity(any(DiplomaPrimariaDatosDto.class))).thenReturn(new DiplomaPrimariaEty());
        when(diplomaPrimariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        CadenaDiplomasRequestDto dto = new CadenaDiplomasRequestDto(
                diplomaPrimariaDatos(false), inscripcionSecundariaDatos(), null, null, null);

        assertThrows(ReglaDeNegocioException.class, () -> service.crear(1L, dto));
        verify(diplomaPrimariaRepository).insert(any());
        verifyNoInteractions(inscripcionSecundariaRepository);
    }

    @Test
    void cadenaCompletaInsertaLosCincoNiveles() {
        InscripcionEty inscripcion = new InscripcionEty();
        inscripcion.setId(1L);
        when(inscripcionRepository.findById(1L)).thenReturn(Optional.of(inscripcion));

        // thenAnswer (no thenReturn de una entidad en blanco): el mapper real copiaria las
        // firmas del dto -- si el mock devolviera siempre una entidad en blanco (todo false),
        // la validacion de completitud de diplomaPrimaria fallaria igual aunque el dto diga
        // "todas las firmas en true" (mismo error que ya paso una vez en DiplomaPrimariaServiceImplTest).
        when(diplomaPrimariaMapper.toEntity(any(DiplomaPrimariaDatosDto.class))).thenAnswer(inv -> {
            DiplomaPrimariaDatosDto d = inv.getArgument(0);
            DiplomaPrimariaEty e = new DiplomaPrimariaEty();
            e.setFirmaMaestro1ro(d.firmaMaestro1ro());
            e.setFirmaMaestro2do(d.firmaMaestro2do());
            e.setFirmaMaestro3ro(d.firmaMaestro3ro());
            e.setFirmaMaestro4to(d.firmaMaestro4to());
            e.setFirmaMaestro5to(d.firmaMaestro5to());
            e.setFirmaMaestro6to(d.firmaMaestro6to());
            e.setFirmaDirectorPrimaria(d.firmaDirectorPrimaria());
            return e;
        });
        when(diplomaPrimariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        when(inscripcionSecundariaMapper.toEntity(any(InscripcionSecundariaDatosDto.class)))
                .thenReturn(new InscripcionSecundariaEty());
        when(inscripcionSecundariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        when(diplomaSecundariaMapper.toEntity(any(DiplomaSecundariaRequestDto.class))).thenAnswer(inv -> {
            DiplomaSecundariaRequestDto d = inv.getArgument(0);
            DiplomaSecundariaEty e = new DiplomaSecundariaEty();
            e.setFirmaMaestroPrimerGrado(d.firmaMaestroPrimerGrado());
            e.setFirmaMaestroSegundoGrado(d.firmaMaestroSegundoGrado());
            e.setFirmaMaestroTercerGrado(d.firmaMaestroTercerGrado());
            e.setFirmaOrientador(d.firmaOrientador());
            e.setFirmaDirectorSecundaria(d.firmaDirectorSecundaria());
            return e;
        });
        when(diplomaSecundariaRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        when(inscripcionUniversidadMapper.toEntity(any(InscripcionUniversidadDatosDto.class)))
                .thenReturn(new InscripcionUniversidadEty());
        when(inscripcionUniversidadRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        when(diplomaUniversidadMapper.toEntity(any(DiplomaUniversidadRequestDto.class)))
                .thenReturn(new DiplomaUniversidadEty());
        when(diplomaUniversidadRepository.insert(any())).thenAnswer(inv -> inv.getArgument(0));

        CadenaDiplomasRequestDto dto = new CadenaDiplomasRequestDto(
                diplomaPrimariaDatos(true),
                inscripcionSecundariaDatos(),
                diplomaSecundariaDatos(true),
                inscripcionUniversidadDatos(),
                diplomaUniversidadDatos(true));

        service.crear(1L, dto);

        verify(diplomaPrimariaRepository).insert(any());
        verify(inscripcionSecundariaRepository).insert(any());
        verify(diplomaSecundariaRepository).insert(any());
        verify(inscripcionUniversidadRepository).insert(any());
        verify(diplomaUniversidadRepository).insert(any());
    }

    // --- Helpers ---

    private static CadenaDiplomasRequestDto peticionSoloDiplomaPrimaria(boolean todasLasFirmas) {
        return new CadenaDiplomasRequestDto(diplomaPrimariaDatos(todasLasFirmas), null, null, null, null);
    }

    private static DiplomaPrimariaDatosDto diplomaPrimariaDatos(boolean todasLasFirmas) {
        return new DiplomaPrimariaDatosDto(
                todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas);
    }

    private static InscripcionSecundariaDatosDto inscripcionSecundariaDatos() {
        return new InscripcionSecundariaDatosDto(1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, LocalDateTime.now(), null);
    }

    private static DiplomaSecundariaRequestDto diplomaSecundariaDatos(boolean todasLasFirmas) {
        return new DiplomaSecundariaRequestDto(
                todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas);
    }

    private static InscripcionUniversidadDatosDto inscripcionUniversidadDatos() {
        return new InscripcionUniversidadDatosDto(1L, 1L, 1L, 1L, 1L, 1L, "P", "1", null, LocalDateTime.now(), null);
    }

    private static DiplomaUniversidadRequestDto diplomaUniversidadDatos(boolean todasLasFirmas) {
        return new DiplomaUniversidadRequestDto(todasLasFirmas, todasLasFirmas, todasLasFirmas, todasLasFirmas);
    }
}

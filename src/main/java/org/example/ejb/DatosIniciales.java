package org.example.ejb;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import org.example.builder.ClaseBuilder;
import org.example.builder.MatriculaBuilder;
import org.example.lib.CarreraRepository;
import org.example.lib.ClaseRepository;
import org.example.lib.EstudianteRepository;
import org.example.lib.MateriaRepository;
import org.example.lib.MatriculaRepository;
import org.example.lib.PasswordHasher;
import org.example.lib.ProfesorRepository;
import org.example.model.Carrera;
import org.example.model.Clase;
import org.example.model.EstadoMatricula;
import org.example.model.Estudiante;
import org.example.model.Materia;
import org.example.model.Matricula;
import org.example.model.Profesor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// Siembra todo el dato "estatico" del sistema (carreras, plan de estudio, profesores,
// habilitaciones, clases) mas un par de estudiantes/matriculas de ejemplo -- lo unico que
// el enunciado deja como dinamico es la seccion de matricula (MatriculaController), que se
// prueba SOBRE estos datos ya sembrados. @Singleton @Startup: corre una sola vez al
// desplegar, igual que DatosIniciales en HelloJakarta-variante.
@Singleton
@Startup
public class DatosIniciales {

    @Inject
    private CarreraRepository carreraRepository;

    @Inject
    private MateriaRepository materiaRepository;

    @Inject
    private ProfesorRepository profesorRepository;

    @Inject
    private ClaseRepository claseRepository;

    @Inject
    private EstudianteRepository estudianteRepository;

    @Inject
    private MatriculaRepository matriculaRepository;

    @PostConstruct
    private void inicializar() {
        // No resembrar en cada redeploy -- si ya hay carreras, se asume que ya se sembro.
        if (carreraRepository.findAll().findAny().isPresent()) {
            return;
        }

        Carrera ingenieria = carreraRepository.insert(nuevaCarrera("Ingenieria en Sistemas"));
        Carrera administracion = carreraRepository.insert(nuevaCarrera("Licenciatura en Administracion"));

        List<Materia> materiasIS = sembrarPlanDeEstudio(ingenieria, "IS");
        List<Materia> materiasADM = sembrarPlanDeEstudio(administracion, "ADM");

        // profIS1: el ejemplo exacto del enunciado -- 20 habilitaciones (puede dictar 20
        // materias distintas de la carrera), pero solo se le asignan 3 clases activas.
        Profesor profIS1 = profesorRepository.insert(
                nuevoProfesor("Marta Gimenez", ingenieria, materiasIS.subList(0, 20)));
        Profesor profIS2 = profesorRepository.insert(
                nuevoProfesor("Carlos Rios", ingenieria, materiasIS.subList(20, 25)));
        Profesor profADM1 = profesorRepository.insert(
                nuevoProfesor("Laura Fernandez", administracion, materiasADM.subList(0, 10)));
        Profesor profADM2 = profesorRepository.insert(
                nuevoProfesor("Diego Soto", administracion, materiasADM.subList(10, 25)));

        // Clases: cada una via ClaseBuilder, que valida habilitacion + limite de 3 por
        // profesor -- si algun profesor de arriba quedara sin habilitacion para alguna de
        // estas materias, esto fallaria en el deploy (ReglaDeNegocioException), no en
        // silencio.
        List<Clase> clasesProfIS1 = new ArrayList<>();
        clasesProfIS1.add(crearClase(materiasIS.get(0), profIS1, clasesProfIS1));   // IS 1.1
        clasesProfIS1.add(crearClase(materiasIS.get(5), profIS1, clasesProfIS1));   // IS 2.1
        clasesProfIS1.add(crearClase(materiasIS.get(10), profIS1, clasesProfIS1));  // IS 3.1
        // profIS1 ya tiene 3 -- una 4ta clase aca lanzaria ReglaDeNegocioException a
        // proposito, demostrando el limite (se deja comentado para no romper el deploy):
        // crearClase(materiasIS.get(15), profIS1, clasesProfIS1);

        List<Clase> clasesProfIS2 = new ArrayList<>();
        Clase claseIS20 = crearClase(materiasIS.get(20), profIS2, clasesProfIS2); // IS 5.1
        clasesProfIS2.add(claseIS20);
        clasesProfIS2.add(crearClase(materiasIS.get(21), profIS2, clasesProfIS2)); // IS 5.2

        List<Clase> clasesProfADM1 = new ArrayList<>();
        Clase claseADM0 = crearClase(materiasADM.get(0), profADM1, clasesProfADM1); // ADM 1.1
        clasesProfADM1.add(claseADM0);
        clasesProfADM1.add(crearClase(materiasADM.get(1), profADM1, clasesProfADM1)); // ADM 1.2

        List<Clase> clasesProfADM2 = new ArrayList<>();
        clasesProfADM2.add(crearClase(materiasADM.get(10), profADM2, clasesProfADM2)); // ADM 3.1

        // Estudiantes de ejemplo (passwords hasheadas, nunca en texto plano -- ver
        // PasswordHasher).
        Estudiante ana = estudianteRepository.insert(nuevoEstudiante("ana", "ana12345", ingenieria));
        Estudiante bruno = estudianteRepository.insert(nuevoEstudiante("bruno", "bruno12345", ingenieria));
        Estudiante carla = estudianteRepository.insert(nuevoEstudiante("carla", "carla12345", administracion));

        // Matriculas de ejemplo: una EN_CURSO (para probar el cupo/duplicado al matricular
        // de nuevo) y una COMPLETADA (para que Estudiante.historial() tenga algo que
        // mostrar desde el primer arranque).
        matriculaRepository.insert(new MatriculaBuilder()
                .estudiante(ana)
                .clase(clasesProfIS1.get(0))
                .estado(EstadoMatricula.EN_CURSO)
                .fechaInscripcion(LocalDate.now().minusMonths(1))
                .build());

        matriculaRepository.insert(new MatriculaBuilder()
                .estudiante(ana)
                .clase(claseIS20)
                .estado(EstadoMatricula.COMPLETADA)
                .fechaInscripcion(LocalDate.now().minusMonths(8))
                .fechaCompletada(LocalDate.now().minusMonths(2))
                .build());

        matriculaRepository.insert(new MatriculaBuilder()
                .estudiante(carla)
                .clase(claseADM0)
                .estado(EstadoMatricula.EN_CURSO)
                .fechaInscripcion(LocalDate.now().minusWeeks(2))
                .build());
    }

    private Clase crearClase(Materia materia, Profesor profesor, List<Clase> clasesActualesDelProfesor) {
        Clase clase = new ClaseBuilder()
                .materia(materia)
                .profesor(profesor)
                .clasesActualesDelProfesor(clasesActualesDelProfesor)
                .build();
        return claseRepository.insert(clase);
    }

    // 25 materias = 5 anios x 5 materias, nombres generados (dato de ejemplo, no un plan de
    // estudio real) -- se insertan y se devuelven ya con id, en orden anio1..anio5.
    private List<Materia> sembrarPlanDeEstudio(Carrera carrera, String prefijo) {
        List<Materia> materias = new ArrayList<>();
        for (int anio = 1; anio <= 5; anio++) {
            for (int i = 1; i <= 5; i++) {
                Materia materia = new Materia();
                materia.setNombre("Materia " + prefijo + " " + anio + "." + i);
                materia.setAnio(anio);
                materia.setCarrera(carrera);
                materias.add(materiaRepository.insert(materia));
            }
        }
        return materias;
    }

    private Carrera nuevaCarrera(String nombre) {
        Carrera carrera = new Carrera();
        carrera.setNombre(nombre);
        return carrera;
    }

    private Profesor nuevoProfesor(String nombre, Carrera carrera, List<Materia> habilitaciones) {
        Profesor profesor = new Profesor();
        profesor.setNombre(nombre);
        profesor.setCarrera(carrera);
        profesor.getHabilitaciones().addAll(habilitaciones);
        return profesor;
    }

    private Estudiante nuevoEstudiante(String username, String passwordPlano, Carrera carrera) {
        Estudiante estudiante = new Estudiante();
        estudiante.setUsername(username);
        estudiante.setPasswordHash(PasswordHasher.hash(passwordPlano));
        estudiante.setCarrera(carrera);
        return estudiante;
    }
}

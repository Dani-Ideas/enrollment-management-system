package org.example.ejb;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.example.dto.FormDto;
import org.example.dto.FormRequestDto;
import org.example.lib.FormRepository;
import org.example.lib.FormService;
import org.example.lib.MiniFormAmbRepository;
import org.example.lib.MiniFormEstRepository;
import org.example.lib.MiniFormRespRepository;
import org.example.lib.MiniFormSisRepository;
import org.example.lib.ReglaDeNegocioException;
import org.example.mapper.FormMapper;
import org.example.model.Form;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class FormServiceImpl implements FormService {

    @Inject
    private FormRepository formRepository;

    // ServiceArtifax cachea Form en memoria (ver esa clase, listarImplantaciones()) para
    // poder filtrar por estado/sistema/ambiente sin ir a la BD -- cada escritura de aqui
    // abajo tiene que avisarle, si no el cache se queda con datos viejos (mismo patron que
    // Producto en HelloJakarta-variante).
    @EJB
    private ServiceArtifax serviceArtifax;

    // Necesita los 4 repositorios de catalogo para reemplazar, DESPUES de
    // formMapper.toEntity()/actualizarDesde(), los stubs por id que arma el Mapper por las
    // entidades REALES -- hacen falta completas (no solo el id) para que
    // FormMapper.toDto() pueda aplanarlas a texto legible en la respuesta, y de paso valida
    // que cada id exista de verdad (409 limpio en vez de una FK constraint cruda).
    @Inject
    private MiniFormEstRepository miniFormEstRepository;

    @Inject
    private MiniFormSisRepository miniFormSisRepository;

    @Inject
    private MiniFormRespRepository miniFormRespRepository;

    @Inject
    private MiniFormAmbRepository miniFormAmbRepository;

    @Inject
    private FormMapper formMapper;

    @Override
    public List<FormDto> listar() {
        return formRepository.findAll()
                .map(formMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FormDto buscarPorId(Long id) {
        return formRepository.findById(id).map(formMapper::toDto).orElse(null);
    }

    @Override
    public FormDto crear(FormRequestDto dto) {
        Form form = formMapper.toEntity(dto);
        resolverRelaciones(form, dto);
        Form creado = formRepository.insert(form);
        serviceArtifax.refrescarImplantacion(creado);
        return formMapper.toDto(creado);
    }

    @Override
    public FormDto actualizar(Long id, FormRequestDto dto) {
        return formRepository.findById(id)
                .map(form -> {
                    formMapper.actualizarDesde(form, dto);
                    resolverRelaciones(form, dto);
                    Form actualizado = formRepository.update(form);
                    serviceArtifax.refrescarImplantacion(actualizado);
                    return formMapper.toDto(actualizado);
                })
                .orElse(null);
    }

    // Comun a crear() y actualizar() -- el Mapper ya dejo la entidad con los 6 stubs (solo
    // id) y los campos propios copiados; esto los reemplaza por las entidades REALES (con
    // 404/409 limpio si algun id no existe).
    private void resolverRelaciones(Form form, FormRequestDto dto) {
        form.setEstado(miniFormEstRepository.findById(dto.estadoId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el estado " + dto.estadoId())));
        form.setSistema(miniFormSisRepository.findById(dto.sistemaId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el sistema " + dto.sistemaId())));
        form.setResponsableProyecto(miniFormRespRepository.findById(dto.responsableProyectoId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.responsableProyectoId())));
        form.setResponsableDesarrollo(miniFormRespRepository.findById(dto.responsableDesarrolloId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.responsableDesarrolloId())));
        form.setResponsableImplantacion(miniFormRespRepository.findById(dto.responsableImplantacionId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el responsable " + dto.responsableImplantacionId())));
        form.setAmbiente(miniFormAmbRepository.findById(dto.ambienteId())
                .orElseThrow(() -> new ReglaDeNegocioException("No existe el ambiente " + dto.ambienteId())));
    }
}

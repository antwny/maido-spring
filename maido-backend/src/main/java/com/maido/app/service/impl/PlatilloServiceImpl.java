package com.maido.app.service.impl;

import com.maido.app.entity.Platillo;
import com.maido.app.exception.FileUploadException;
import com.maido.app.exception.ResourceNotFoundException;
import com.maido.app.repository.PlatilloRepository;
import com.maido.app.service.PlatilloService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class PlatilloServiceImpl implements PlatilloService {

    private final PlatilloRepository platilloRepository;

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @Override
    public List<Platillo> listarTodos() {
        return platilloRepository.findByActivoTrue();
    }

    @Override
    public List<Platillo> listarPorCategoria(Long categoriaId) {
        return platilloRepository.findByCategoriaIdAndActivoTrue(categoriaId);
    }

    @Override
    public List<Platillo> buscarPorNombre(String nombre) {
        return platilloRepository.findByNombreContainingIgnoreCaseAndActivoTrue(nombre);
    }

    @Override
    public Optional<Platillo> obtenerPorId(Long id) {
        return platilloRepository.findById(id);
    }

    @Override
    public Platillo guardar(Platillo platillo) {
        return platilloRepository.save(platillo);
    }

    @Override
    public Platillo actualizar(Long id, Platillo datos) {
        return platilloRepository.findById(id).map(p -> {
            p.setNombre(datos.getNombre());
            p.setDescripcion(datos.getDescripcion());
            p.setPrecio(datos.getPrecio());
            p.setCategoria(datos.getCategoria());
            p.setDisponible(datos.getDisponible());
            if (datos.getImagenUrl() != null && !datos.getImagenUrl().isEmpty()) {
                p.setImagenUrl(datos.getImagenUrl());
            }
            return platilloRepository.save(p);
        }).orElseThrow(() -> new ResourceNotFoundException("Platillo", id));
    }

    @Override
    public String subirImagen(MultipartFile file) {
        try {
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = dirPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(filename)
                    .toUriString();
        } catch (IOException e) {
            throw new FileUploadException("Error al subir la imagen", e);
        }
    }

    @Override
    public void eliminar(Long id) {
        platilloRepository.findById(id).ifPresent(p -> {
            p.setActivo(false);
            platilloRepository.save(p);
        });
    }
}

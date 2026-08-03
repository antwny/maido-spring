package com.maido.app.service.impl;

import com.maido.app.entity.Categoria;
import com.maido.app.exception.ResourceNotFoundException;
import com.maido.app.repository.CategoriaRepository;
import com.maido.app.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    public List<Categoria> listarActivas() {
        return categoriaRepository.findByActivoTrue();
    }

    @Override
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Override
    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id).map(c -> {
            c.setNombre(categoriaActualizada.getNombre());
            c.setDescripcion(categoriaActualizada.getDescripcion());
            c.setActivo(categoriaActualizada.getActivo());
            return categoriaRepository.save(c);
        }).orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    @Override
    public void eliminar(Long id) {
        categoriaRepository.findById(id).ifPresent(c -> {
            c.setActivo(false);
            categoriaRepository.save(c);
        });
    }
}

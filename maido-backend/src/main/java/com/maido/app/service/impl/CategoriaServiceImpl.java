package com.maido.app.service.impl;

import com.maido.app.entity.Categoria;
import com.maido.app.exception.ResourceNotFoundException;
import com.maido.app.repository.CategoriaRepository;
import com.maido.app.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * @Service marca esta clase como el proveedor de lógica de negocio para Categorías.
 * @RequiredArgsConstructor hace la magia de inyectar 'categoriaRepository' a través del constructor.
 */
@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    // Dependencia inyectada gracias a @RequiredArgsConstructor
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
        // En lugar de hacer if (categoria == null), usamos Optional y Lambdas.
        // map() transforma la entidad, y orElseThrow() lanza excepción si no se encontró.
        return categoriaRepository.findById(id).map(c -> {
            c.setNombre(categoriaActualizada.getNombre());
            c.setDescripcion(categoriaActualizada.getDescripcion());
            c.setActivo(categoriaActualizada.getActivo());
            return categoriaRepository.save(c);
        }).orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    @Override
    public void eliminar(Long id) {
        // ifPresent() permite ejecutar un bloque de código (la Lambda) SOLO si el Optional contiene un valor.
        // Así evitamos null checks. Además, hacemos un "Soft Delete" (borrado lógico) poniendo activo = false,
        // en vez de borrar el registro físico de la BD.
        categoriaRepository.findById(id).ifPresent(c -> {
            c.setActivo(false);
            categoriaRepository.save(c);
        });
    }
}

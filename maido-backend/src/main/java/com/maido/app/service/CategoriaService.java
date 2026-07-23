package com.maido.app.service;

import com.maido.app.entity.Categoria;
import java.util.List;
import java.util.Optional;

public interface CategoriaService {
    List<Categoria> listarActivas();
    List<Categoria> listarTodas();
    Optional<Categoria> obtenerPorId(Long id);
    Categoria guardar(Categoria categoria);
    Categoria actualizar(Long id, Categoria categoria);
    void eliminar(Long id);
}

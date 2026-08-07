package com.maido.app.service;

import com.maido.app.entity.Categoria;
import java.util.List;
import java.util.Optional;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Interfaz CategoriaService.
 * Define el contrato para las operaciones relacionadas con 'Categoria'.
 * Nota el uso de Optional<Categoria>: Optional es una característica moderna de Java (introducida en Java 8).
 * Sirve para evitar el temido NullPointerException. Básicamente es una caja que puede contener o no a un objeto Categoria.
 */
public interface CategoriaService {
    List<Categoria> listarActivas();
    List<Categoria> listarTodas();
    Optional<Categoria> obtenerPorId(Long id);
    Categoria guardar(Categoria categoria);
    Categoria actualizar(Long id, Categoria categoria);
    void eliminar(Long id);
}

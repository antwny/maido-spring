package com.maido.app.service;

import com.maido.app.entity.Platillo;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Interfaz PlatilloService. Contrato para la lógica de negocio de Platillos.
 * 
 * En la arquitectura por capas (Controlador -> Servicio -> Repositorio):
 * Esta interfaz asegura que el Controlador no tenga que lidiar con la base de datos.
 * El Controlador solo llama a 'subirImagen' o 'listarTodos' y no le importa si los 
 * datos vienen de MySQL, MongoDB, o un archivo de texto.
 */
public interface PlatilloService {
    List<Platillo> listarTodos();
    Page<Platillo> listarTodosPaginado(Pageable pageable);
    List<Platillo> listarPorCategoria(Long categoriaId);
    List<Platillo> buscarPorNombre(String nombre);
    Optional<Platillo> obtenerPorId(Long id);
    Platillo guardar(Platillo platillo);
    Platillo actualizar(Long id, Platillo platillo);
    String subirImagen(MultipartFile file);
    void eliminar(Long id);
    Page<Platillo> listarTodosAdmin(Pageable pageable);
    Platillo restaurar(Long id);
    Platillo toggleDisponible(Long id);
}

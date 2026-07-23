package com.maido.app.service;

import com.maido.app.entity.Platillo;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

public interface PlatilloService {
    List<Platillo> listarTodos();
    List<Platillo> listarPorCategoria(Long categoriaId);
    List<Platillo> buscarPorNombre(String nombre);
    Optional<Platillo> obtenerPorId(Long id);
    Platillo guardar(Platillo platillo);
    Platillo actualizar(Long id, Platillo platillo);
    String subirImagen(MultipartFile file);
    void eliminar(Long id);
}

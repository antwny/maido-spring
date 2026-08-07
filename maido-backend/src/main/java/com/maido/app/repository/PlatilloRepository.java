package com.maido.app.repository;

import com.maido.app.entity.Platillo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repositorio de Platillos.
 * Ya sabemos que @Repository y heredar de JpaRepository nos da los superpoderes CRUD.
 */
@Repository
public interface PlatilloRepository extends JpaRepository<Platillo, Long> {
    
    // Devuelve todos los platillos donde "activo" sea true.
    List<Platillo> findByActivoTrue();
    
    // Filtra por el ID de la categoría asociada y además verifica que esté activo.
    List<Platillo> findByCategoriaIdAndActivoTrue(Long categoriaId);
    
    /* 
     * "Containing" genera un LIKE '%nombre%' en SQL.
     * "IgnoreCase" hace que la búsqueda no distinga entre mayúsculas y minúsculas.
     * Todo esto generado mágicamente solo por el nombre del método.
     */
    List<Platillo> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
    
    // Versión paginada de la búsqueda de activos.
    Page<Platillo> findByActivoTrue(Pageable pageable);
    
    // Ordena primero por "activo" de forma descendente (true antes que false), 
    // y luego por nombre alfabéticamente. Todo con paginación.
    Page<Platillo> findAllByOrderByActivoDescNombreAsc(Pageable pageable);
    
    // Cuenta platillos que están activos pero no disponibles en este momento.
    long countByActivoTrueAndDisponibleFalse();
}

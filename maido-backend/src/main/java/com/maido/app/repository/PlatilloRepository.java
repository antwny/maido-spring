package com.maido.app.repository;

import com.maido.app.entity.Platillo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface PlatilloRepository extends JpaRepository<Platillo, Long> {
    List<Platillo> findByActivoTrue();
    List<Platillo> findByCategoriaIdAndActivoTrue(Long categoriaId);
    List<Platillo> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
    Page<Platillo> findByActivoTrue(Pageable pageable);
    Page<Platillo> findAllByOrderByActivoDescNombreAsc(Pageable pageable);
    long countByActivoTrueAndDisponibleFalse();
}

package com.maido.app.repository;

import com.maido.app.entity.Platillo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlatilloRepository extends JpaRepository<Platillo, Long> {
    List<Platillo> findByActivoTrue();
    List<Platillo> findByCategoriaIdAndActivoTrue(Long categoriaId);
    List<Platillo> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
}

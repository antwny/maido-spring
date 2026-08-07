package com.maido.app.repository;

import com.maido.app.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * ¡Bienvenido a la capa de acceso a datos! 📚
 * 
 * La anotación @Repository le indica a Spring que esta interfaz es un componente 
 * encargado de comunicarse con la base de datos. Spring creará una implementación 
 * automática de esta interfaz en tiempo de ejecución.
 */
@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    /*
     * Aquí estamos usando la "Herencia de Interfaces". Al extender JpaRepository,
     * obtenemos GRATIS un montón de métodos para operar con la tabla 'categoria':
     * save(), findAll(), findById(), deleteById(), etc.
     * Los genéricos <Categoria, Long> indican la entidad a manejar y el tipo de su clave primaria (ID).
     */

    /*
     * ¡Magia de Spring Data JPA: Query Methods! ✨
     * Spring es tan inteligente que puede crear consultas SQL basándose en el NOMBRE del método.
     * "findByActivoTrue" se traduce automáticamente a:
     * SELECT * FROM categoria WHERE activo = true;
     * No tienes que escribir nada de SQL manualmente.
     */
    List<Categoria> findByActivoTrue();
}

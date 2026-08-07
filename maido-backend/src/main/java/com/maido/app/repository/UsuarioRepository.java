package com.maido.app.repository;

import com.maido.app.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para acceder a los Usuarios en la base de datos.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /*
     * Uso de Optional 🛡️
     * En lugar de devolver 'Usuario' directamente (que podría ser null si el email no existe),
     * devolvemos un 'Optional<Usuario>'. Esto es una buena práctica en Java moderno para evitar
     * los temidos NullPointerException. Obliga a quien llama a este método a comprobar si el 
     * usuario está presente o no antes de usarlo.
     */
    Optional<Usuario> findByEmail(String email);
    
    /*
     * Un Query Method que devuelve un boolean. 
     * Spring ejecutará internamente una consulta optimizada para comprobar si existe 
     * al menos un registro con ese email.
     */
    boolean existsByEmail(String email);
}

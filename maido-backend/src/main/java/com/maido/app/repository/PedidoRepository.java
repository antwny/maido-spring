package com.maido.app.repository;

import com.maido.app.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repositorio para la entidad Pedido.
 * Como puedes ver, extiende JpaRepository, por lo que heredamos todas las operaciones CRUD.
 */
@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    /* 
     * Query Methods más complejos:
     * Aquí le decimos a Spring: "Busca pedidos por el ID del usuario y ordénalos por fecha descendente".
     * SQL generado: SELECT * FROM pedido WHERE usuario_id = ? ORDER BY fecha_pedido DESC
     */
    List<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId);
    
    List<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado);
    
    // "Between" permite buscar en un rango de fechas.
    List<Pedido> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDateTime inicio, LocalDateTime fin);
    
    List<Pedido> findAllByOrderByFechaPedidoDesc();
    
    /*
     * Paginación en Spring Data JPA 📖
     * Al devolver un objeto 'Page' y recibir un parámetro 'Pageable',
     * Spring automáticamente limita los resultados (LIMIT, OFFSET) y 
     * devuelve metadatos como el número total de páginas.
     */
    Page<Pedido> findAllByOrderByFechaPedidoDesc(Pageable pageable);
    
    Page<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado, Pageable pageable);
    
    // El prefijo "countBy" genera una consulta SQL tipo: SELECT COUNT(*) FROM...
    long countByEstado(String estado);

    /*
     * Uso de @Query 🛠️
     * Cuando los Query Methods (los nombres de los métodos) se vuelven muy largos o necesitamos 
     * hacer consultas complejas (como sumas, joins específicos), podemos escribir nuestra propia 
     * consulta JPQL (Java Persistence Query Language).
     * JPQL interactúa con nuestras ENTIDADES de Java, no con las tablas reales de la base de datos.
     */
    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado != 'CANCELADO' AND p.fechaPedido >= :inicio AND p.fechaPedido <= :fin")
    java.math.BigDecimal sumIngresosPorRango(@org.springframework.data.repository.query.Param("inicio") LocalDateTime inicio, @org.springframework.data.repository.query.Param("fin") LocalDateTime fin);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado != 'CANCELADO'")
    java.math.BigDecimal sumIngresosTotales();

    long countByFechaPedidoBetween(LocalDateTime inicio, LocalDateTime fin);
    
    long countByFechaPedidoBetweenAndEstado(LocalDateTime inicio, LocalDateTime fin, String estado);
    
    Page<Pedido> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

    // Con el operador "IN" podemos pasar una lista de valores.
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado IN :estados")
    long countByEstadoIn(@org.springframework.data.repository.query.Param("estados") java.util.List<String> estados);
}

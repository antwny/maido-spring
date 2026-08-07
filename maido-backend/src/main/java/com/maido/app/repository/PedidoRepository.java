package com.maido.app.repository;

import com.maido.app.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId);
    List<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado);
    List<Pedido> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDateTime inicio, LocalDateTime fin);
    List<Pedido> findAllByOrderByFechaPedidoDesc();
    Page<Pedido> findAllByOrderByFechaPedidoDesc(Pageable pageable);
    Page<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado, Pageable pageable);
    long countByEstado(String estado);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado != 'CANCELADO' AND p.fechaPedido >= :inicio AND p.fechaPedido <= :fin")
    java.math.BigDecimal sumIngresosPorRango(@org.springframework.data.repository.query.Param("inicio") LocalDateTime inicio, @org.springframework.data.repository.query.Param("fin") LocalDateTime fin);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado != 'CANCELADO'")
    java.math.BigDecimal sumIngresosTotales();

    long countByFechaPedidoBetween(LocalDateTime inicio, LocalDateTime fin);
    long countByFechaPedidoBetweenAndEstado(LocalDateTime inicio, LocalDateTime fin, String estado);
    Page<Pedido> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado IN :estados")
    long countByEstadoIn(@org.springframework.data.repository.query.Param("estados") java.util.List<String> estados);
}

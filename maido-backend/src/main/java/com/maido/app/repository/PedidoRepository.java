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
}

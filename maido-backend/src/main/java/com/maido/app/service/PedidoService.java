package com.maido.app.service;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PedidoService {
    PedidoResponse crearPedido(PedidoRequest request);
    List<PedidoResponse> listarTodos();
    Page<PedidoResponse> listarTodosPaginado(String estado, LocalDateTime inicio, LocalDateTime fin, Pageable pageable);
    java.util.Map<String, Long> obtenerConteosPorEstado();
    com.maido.app.dto.DashboardStatsResponse obtenerEstadisticasDashboard();
    List<PedidoResponse> listarPorUsuario(Long usuarioId);
    List<PedidoResponse> listarPorEstado(String estado);
    List<PedidoResponse> listarPorRangoDeFecha(LocalDateTime inicio, LocalDateTime fin);
    PedidoResponse cambiarEstado(Long id, String estado);
    PedidoResponse obtenerPorId(Long id);
}

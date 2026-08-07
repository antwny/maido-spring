package com.maido.app.service;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Interfaz PedidoService. Contrato para el dominio de Pedidos.
 * Aquí vemos cómo los métodos devuelven "DTOs" (Data Transfer Objects) como PedidoResponse
 * en lugar de la Entidad directa. Esto es un patrón de diseño excelente porque protege 
 * la base de datos de exponer campos internos (como contraseñas en Usuarios) y adapta 
 * los datos exactamente a lo que necesita la vista/frontend.
 */
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

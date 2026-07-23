package com.maido.app.service;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoService {
    PedidoResponse crearPedido(PedidoRequest request);
    List<PedidoResponse> listarTodos();
    List<PedidoResponse> listarPorUsuario(Long usuarioId);
    List<PedidoResponse> listarPorEstado(String estado);
    List<PedidoResponse> listarPorRangoDeFecha(LocalDateTime inicio, LocalDateTime fin);
    PedidoResponse cambiarEstado(Long id, String estado);
    PedidoResponse obtenerPorId(Long id);
}

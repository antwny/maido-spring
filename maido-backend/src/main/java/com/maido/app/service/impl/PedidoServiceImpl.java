package com.maido.app.service.impl;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import com.maido.app.entity.DetallePedido;
import com.maido.app.entity.Pedido;
import com.maido.app.entity.Platillo;
import com.maido.app.entity.Usuario;
import com.maido.app.repository.PedidoRepository;
import com.maido.app.repository.PlatilloRepository;
import com.maido.app.repository.UsuarioRepository;
import com.maido.app.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlatilloRepository platilloRepository;

    @Override
    @Transactional
    public PedidoResponse crearPedido(PedidoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + request.getUsuarioId()));

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .fechaPedido(LocalDateTime.now())
                .estado("PENDIENTE")
                .direccionEntrega(request.getDireccionEntrega())
                .observaciones(request.getObservaciones())
                .total(BigDecimal.ZERO)
                .build();

        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PedidoRequest.DetallePedidoRequest dr : request.getDetalles()) {
            Platillo platillo = platilloRepository.findById(dr.getPlatilloId())
                    .orElseThrow(() -> new RuntimeException("Platillo no encontrado: " + dr.getPlatilloId()));

            BigDecimal subtotal = dr.getPrecioUnitario().multiply(BigDecimal.valueOf(dr.getCantidad()));
            total = total.add(subtotal);

            DetallePedido detalle = DetallePedido.builder()
                    .pedido(pedido)
                    .platillo(platillo)
                    .cantidad(dr.getCantidad())
                    .precioUnitario(dr.getPrecioUnitario())
                    .subtotal(subtotal)
                    .build();
            detalles.add(detalle);
        }

        pedido.setTotal(total);
        pedido.setDetalles(detalles);

        Pedido guardado = pedidoRepository.save(pedido);
        return mapToResponse(guardado);
    }

    @Override
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAllByOrderByFechaPedidoDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaPedidoDesc(usuarioId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<PedidoResponse> listarPorEstado(String estado) {
        return pedidoRepository.findByEstadoOrderByFechaPedidoDesc(estado)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<PedidoResponse> listarPorRangoDeFecha(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findByFechaPedidoBetweenOrderByFechaPedidoDesc(inicio, fin)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PedidoResponse cambiarEstado(Long id, String estado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
        pedido.setEstado(estado);
        return mapToResponse(pedidoRepository.save(pedido));
    }

    @Override
    public PedidoResponse obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }

    private PedidoResponse mapToResponse(Pedido pedido) {
        List<PedidoResponse.DetalleResponse> detallesResp = pedido.getDetalles().stream()
                .map(d -> PedidoResponse.DetalleResponse.builder()
                        .platilloId(d.getPlatillo().getId())
                        .platilloNombre(d.getPlatillo().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return PedidoResponse.builder()
                .id(pedido.getId())
                .usuarioId(pedido.getUsuario().getId())
                .usuarioNombre(pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido())
                .fechaPedido(pedido.getFechaPedido())
                .estado(pedido.getEstado())
                .total(pedido.getTotal())
                .direccionEntrega(pedido.getDireccionEntrega())
                .observaciones(pedido.getObservaciones())
                .detalles(detallesResp)
                .build();
    }
}

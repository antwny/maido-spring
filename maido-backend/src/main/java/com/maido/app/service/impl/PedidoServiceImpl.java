package com.maido.app.service.impl;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import com.maido.app.entity.DetallePedido;
import com.maido.app.exception.ResourceNotFoundException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * @Service define la lógica core para manejar Pedidos.
 * @RequiredArgsConstructor inyecta automáticamente los repositorios a través del constructor.
 */
@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    // Múltiples dependencias inyectadas, todas requeridas y declaradas final.
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlatilloRepository platilloRepository;

    /**
     * Crea un nuevo pedido en la base de datos.
     * 
     * 🎓 @Transactional es CRÍTICO aquí: Si algo falla a la mitad del método 
     * (por ejemplo, el platillo no existe y lanza una excepción), Spring Boot 
     * hace un "Rollback" automático. Es decir, deshace cualquier cambio previo 
     * en la base de datos para evitar que se guarde un pedido a medias (datos corruptos).
     */
    @Override
    @Transactional
    public PedidoResponse crearPedido(PedidoRequest request) {
        // 1. Buscamos al usuario. orElseThrow desenvuelve el Optional o lanza excepción.
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", request.getUsuarioId()));

        // 2. Patrón Builder (Lombok) para construir el objeto sin un constructor kilométrico.
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
                    .orElseThrow(() -> new ResourceNotFoundException("Platillo", dr.getPlatilloId()));

            // Uso de BigDecimal para dinero. Nunca uses double/float para monedas por problemas de precisión.
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
        // 🎓 STREAMS y LAMBDAS:
        // .stream() convierte la lista a un flujo de datos.
        // .map() aplica la función 'mapToResponse' (usando Method Reference this::mapToResponse) a cada elemento.
        // .collect(Collectors.toList()) junta todos los resultados transformados en una nueva Lista.
        return pedidoRepository.findAllByOrderByFechaPedidoDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public Page<PedidoResponse> listarTodosPaginado(String estado, LocalDateTime inicio, LocalDateTime fin, Pageable pageable) {
        Page<Pedido> pedidos;
        if (inicio != null && fin != null) {
            pedidos = pedidoRepository.findByFechaPedidoBetweenOrderByFechaPedidoDesc(inicio, fin, pageable);
        } else if (estado != null && !estado.isEmpty()) {
            pedidos = pedidoRepository.findByEstadoOrderByFechaPedidoDesc(estado, pageable);
        } else {
            pedidos = pedidoRepository.findAllByOrderByFechaPedidoDesc(pageable);
        }
        // Page.map() funciona igual que Stream.map(), transforma Entidades a DTOs dentro de la página.
        return pedidos.map(this::mapToResponse);
    }

    @Override
    public java.util.Map<String, Long> obtenerConteosPorEstado() {
        java.util.Map<String, Long> conteos = new java.util.HashMap<>();
        conteos.put("TODOS", pedidoRepository.count());
        conteos.put("PENDIENTE", pedidoRepository.countByEstado("PENDIENTE"));
        conteos.put("EN_PREPARACION", pedidoRepository.countByEstado("EN_PREPARACION"));
        conteos.put("EN_CAMINO", pedidoRepository.countByEstado("EN_CAMINO"));
        conteos.put("ENTREGADO", pedidoRepository.countByEstado("ENTREGADO"));
        conteos.put("CANCELADO", pedidoRepository.countByEstado("CANCELADO"));
        return conteos;
    }

    @Override
    public com.maido.app.dto.DashboardStatsResponse obtenerEstadisticasDashboard() {
        LocalDateTime inicioDia = LocalDateTime.now().with(java.time.LocalTime.MIN);
        LocalDateTime finDia = LocalDateTime.now().with(java.time.LocalTime.MAX);
        
        java.math.BigDecimal ingresosHoy = pedidoRepository.sumIngresosPorRango(inicioDia, finDia);
        java.math.BigDecimal ingresosTotales = pedidoRepository.sumIngresosTotales();
        
        long pedidosHoy = pedidoRepository.countByFechaPedidoBetween(inicioDia, finDia);
        long pedidosActivos = pedidoRepository.countByEstadoIn(java.util.Arrays.asList("PENDIENTE", "EN_PREPARACION", "EN_CAMINO"));
        long platillosAgotados = platilloRepository.countByActivoTrueAndDisponibleFalse();

        return com.maido.app.dto.DashboardStatsResponse.builder()
                .ingresosHoy(ingresosHoy != null ? ingresosHoy : java.math.BigDecimal.ZERO)
                .ingresosTotales(ingresosTotales != null ? ingresosTotales : java.math.BigDecimal.ZERO)
                .pedidosHoy(pedidosHoy)
                .pedidosActivos(pedidosActivos)
                .platillosAgotados(platillosAgotados)
                .build();
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
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
        pedido.setEstado(estado);
        return mapToResponse(pedidoRepository.save(pedido));
    }

    @Override
    public PedidoResponse obtenerPorId(Long id) {
        // Uso elegante de Optional:
        // findById -> Optional<Pedido>
        // map -> transforma a Optional<PedidoResponse>
        // orElseThrow -> devuelve PedidoResponse o explota si era nulo.
        return pedidoRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
    }

    /**
     * 🎓 Función de mapeo auxiliar. Convierte la Entidad a un DTO.
     */
    private PedidoResponse mapToResponse(Pedido pedido) {
        // Transformando la lista hija (detalles) a su respectivo DTO usando Streams y Lambdas.
        List<PedidoResponse.DetalleResponse> detallesResp = pedido.getDetalles().stream()
                .map(d -> PedidoResponse.DetalleResponse.builder()
                            .platilloId(d.getPlatillo().getId())
                            .platilloNombre(d.getPlatillo().getNombre())
                            .platilloImagenUrl(d.getPlatillo().getImagenUrl())
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

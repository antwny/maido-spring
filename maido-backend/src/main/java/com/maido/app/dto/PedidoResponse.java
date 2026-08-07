package com.maido.app.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoResponse {

    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fechaPedido;
    private String estado;
    private BigDecimal total;
    private String direccionEntrega;
    private String observaciones;
    private List<DetalleResponse> detalles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleResponse {
        private Long platilloId;
        private String platilloNombre;
        private String platilloImagenUrl;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}

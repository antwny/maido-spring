package com.maido.app.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoRequest {

    private Long usuarioId;
    private String direccionEntrega;
    private String observaciones;
    private List<DetallePedidoRequest> detalles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetallePedidoRequest {
        private Long platilloId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
    }
}

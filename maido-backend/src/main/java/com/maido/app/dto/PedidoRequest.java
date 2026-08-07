package com.maido.app.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Patrón DTO (Data Transfer Object).
 * Este DTO es excelente para recibir datos anidados desde un JSON (pedido + sus detalles).
 * No exponemos las Entidades Pedido ni DetallePedido, sino que recibimos IDs y cantidades.
 * Luego, en la capa de Servicio (Service), validaremos si estos platillos existen y armaremos la Entidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoRequest {

    private Long usuarioId;
    private String direccionEntrega;
    private String observaciones;
    private List<DetallePedidoRequest> detalles;

    /**
     * Clase estática anidada que actúa como DTO para los elementos de la lista.
     */
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

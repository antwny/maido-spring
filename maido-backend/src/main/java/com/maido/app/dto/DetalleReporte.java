package com.maido.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Patrón DTO (Data Transfer Object).
 * Esta clase es una estructura de datos simple que transporta información consolidada de un reporte.
 * Al usar un DTO, desacoplamos la lógica de persistencia de la presentación.
 * Si el día de mañana cambiamos la tabla de pedidos, este DTO se mantiene igual para el frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleReporte {
    private String id;
    private String fecha;
    private String cliente;
    private String metodoPago;
    private String estado;
    private BigDecimal total;
}

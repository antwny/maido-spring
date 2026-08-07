package com.maido.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Patrón DTO.
 * Envuelve datos agregados o procesados (totales, recuentos).
 * Nunca verás una tabla llamada "ReporteResumenResponse" en la base de datos, 
 * esto es puramente para dar respuesta a un requerimiento de la interfaz gráfica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResumenResponse {
    private BigDecimal ingresos;
    private long totalPedidos;
    private long entregados;
    private long cancelados;
}

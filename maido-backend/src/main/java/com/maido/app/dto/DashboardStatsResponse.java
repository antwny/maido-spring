package com.maido.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal ingresosHoy;
    private BigDecimal ingresosTotales;
    private long pedidosHoy;
    private long pedidosActivos;
    private long platillosAgotados;
}

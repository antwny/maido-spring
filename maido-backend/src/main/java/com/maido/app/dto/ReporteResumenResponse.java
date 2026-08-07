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
public class ReporteResumenResponse {
    private BigDecimal ingresos;
    private long totalPedidos;
    private long entregados;
    private long cancelados;
}

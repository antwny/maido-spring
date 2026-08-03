package com.maido.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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

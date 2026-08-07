package com.maido.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Patrón DTO (Data Transfer Object).
 * Los DTOs se utilizan para transferir datos entre el backend y el cliente (frontend).
 * NUNCA debemos exponer directamente nuestras Entidades (modelos de base de datos) porque:
 * 1. Podemos filtrar información sensible (contraseñas, datos internos).
 * 2. Evitamos problemas de ciclos infinitos en relaciones bidireccionales al convertirlas a JSON.
 * 3. Nos permite moldear exactamente la respuesta que la vista (frontend) necesita sin alterar la base de datos.
 * 
 * En este caso, DashboardStatsResponse agrupa únicamente los cálculos necesarios para el dashboard.
 */
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

package com.maido.app.service;

import java.time.LocalDateTime;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Interfaz ReporteService.
 * Define la lógica de negocio especializada en generar reportes.
 * En lugar de agrupar todo en un "SuperService", seguimos el principio de "Single Responsibility"
 * (Responsabilidad Única) separando los reportes de los pedidos o platillos.
 */
public interface ReporteService {
    byte[] generarReporteVentasPdf(LocalDateTime inicio, LocalDateTime fin);
    com.maido.app.dto.ReporteResumenResponse obtenerResumen(LocalDateTime inicio, LocalDateTime fin);
}

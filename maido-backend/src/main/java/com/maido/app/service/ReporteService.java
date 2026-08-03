package com.maido.app.service;

import java.time.LocalDateTime;

public interface ReporteService {
    byte[] generarReporteVentasPdf(LocalDateTime inicio, LocalDateTime fin);
}

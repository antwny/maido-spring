package com.maido.app.service.impl;

import com.maido.app.dto.DetalleReporte;
import com.maido.app.entity.Pedido;
import com.maido.app.exception.BusinessException;
import com.maido.app.repository.PedidoRepository;
import com.maido.app.service.ReporteService;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements ReporteService {

    private final PedidoRepository pedidoRepository;

    @Override
    public byte[] generarReporteVentasPdf(LocalDateTime inicio, LocalDateTime fin) {
        try {
            // 1. Obtener datos
            List<Pedido> pedidos = pedidoRepository.findByFechaPedidoBetweenOrderByFechaPedidoDesc(inicio, fin);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            BigDecimal totalVentas = BigDecimal.ZERO;

            List<DetalleReporte> detalles = pedidos.stream().map(p -> {
                String metodoPago = extraerMetodoPago(p.getObservaciones());
                return DetalleReporte.builder()
                        .id(p.getId().toString())
                        .fecha(p.getFechaPedido().format(formatter))
                        .cliente(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                        .metodoPago(metodoPago)
                        .estado(p.getEstado())
                        .total(p.getTotal())
                        .build();
            }).collect(Collectors.toList());

            for (DetalleReporte d : detalles) {
                if (!"CANCELADO".equals(d.getEstado())) {
                    totalVentas = totalVentas.add(d.getTotal());
                }
            }

            // 2. Cargar plantilla JRXML
            InputStream reportStream = new ClassPathResource("reports/reporte_ventas.jrxml").getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

            // 3. Parámetros del reporte
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("fechaInicio", inicio.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            parameters.put("fechaFin", fin.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            parameters.put("totalVentas", "S/ " + totalVentas.toString());
            parameters.put("cantidadPedidos", String.valueOf(pedidos.size()));
            
            // 4. Llenar reporte
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(detalles);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // 5. Exportar a PDF (byte array)
            return JasperExportManager.exportReportToPdf(jasperPrint);

        } catch (Exception e) {
            throw new BusinessException("Error al generar el reporte PDF: " + e.getMessage());
        }
    }

    private String extraerMetodoPago(String observaciones) {
        if (observaciones == null || observaciones.isEmpty()) return "N/A";
        Pattern pattern = Pattern.compile("^\\[(.*?)\\]");
        Matcher matcher = pattern.matcher(observaciones);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "N/A";
    }
}

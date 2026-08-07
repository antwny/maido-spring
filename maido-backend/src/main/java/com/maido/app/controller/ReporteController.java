package com.maido.app.controller;

import com.maido.app.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Controlador REST para la generación de reportes y estadísticas.
 * 
 * Rol en la Arquitectura:
 * Se encarga de procesar las solicitudes para descargar o visualizar reportes.
 * Es un ejemplo de un controlador que no solo devuelve JSON, sino que también 
 * puede devolver archivos binarios (como un PDF).
 */
@RestController
@RequestMapping("/api/v1/reportes")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    /**
     * Genera y exporta un documento PDF con el reporte de ventas en un rango de fechas.
     * 
     * @param inicio Fecha de inicio del reporte.
     * @param fin Fecha final del reporte.
     * @return Archivo PDF en formato de arreglo de bytes.
     */
    @GetMapping("/exportar-pdf")
    // El método devuelve un ResponseEntity<byte[]> dado que un archivo se transmite como flujo de bytes.
    public ResponseEntity<byte[]> exportarPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        // Obtenemos los bytes del documento generado en la capa de servicio.
        byte[] pdfBytes = reporteService.generarReporteVentasPdf(inicio, fin);
        
        // HttpHeaders permite modificar las cabeceras de la respuesta HTTP.
        HttpHeaders headers = new HttpHeaders();
        // Indicamos que el contenido es un PDF, así el navegador sabrá qué hacer (ej. abrir el visor de PDF).
        headers.setContentType(MediaType.APPLICATION_PDF);
        // Indicamos que se trata de un archivo adjunto que se debe descargar, y le asignamos un nombre.
        headers.setContentDispositionFormData("filename", "reporte_ventas.pdf");
        
        // Construimos la respuesta agregando los headers configurados y el archivo binario en el body.
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    /**
     * Obtiene un resumen numérico para reportes en formato JSON.
     * 
     * @param inicio Fecha inicial del resumen.
     * @param fin Fecha final del resumen.
     */
    @GetMapping("/resumen")
    public ResponseEntity<com.maido.app.dto.ReporteResumenResponse> obtenerResumen(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        // Llama al servicio de reportes y envuelve el DTO (Data Transfer Object) de respuesta en un HTTP 200 OK.
        return ResponseEntity.ok(reporteService.obtenerResumen(inicio, fin));
    }
}

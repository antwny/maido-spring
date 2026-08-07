package com.maido.app.controller;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import com.maido.app.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de los Pedidos.
 * 
 * Rol en la Arquitectura:
 * Actúa como punto de interacción para los clientes. Recibe peticiones HTTP relacionadas
 * con los pedidos, delega el trabajo pesado al PedidoService y emite respuestas HTTP
 * mediante objetos ResponseEntity.
 */
@RestController
@RequestMapping("/api/v1/pedidos")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    /**
     * Crea un nuevo pedido.
     */
    @PostMapping
    public ResponseEntity<PedidoResponse> crear(@RequestBody PedidoRequest request) {
        // Retorna estado HTTP 201 (Created) junto con el pedido recién creado.
        return ResponseEntity.status(201).body(pedidoService.crearPedido(request));
    }

    /**
     * Obtiene una lista de pedidos. Permite filtrar de forma dinámica según los parámetros enviados en la URL.
     * 
     * @param usuarioId ID del usuario para filtrar sus pedidos.
     * @param estado Estado del pedido para filtrar (ej. 'PENDIENTE', 'COMPLETADO').
     * @param inicio Fecha de inicio para un rango de búsqueda.
     * @param fin Fecha de fin para un rango de búsqueda.
     */
    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar(
            // @RequestParam extrae parámetros de consulta (query parameters) de la URL (ej. ?usuarioId=1)
            // required = false significa que el parámetro es opcional.
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String estado,
            // @DateTimeFormat asegura que el String de fecha que viene en la URL se convierta correctamente a LocalDateTime usando formato ISO.
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        // Lógica condicional para decidir qué método del servicio llamar dependiendo de los filtros aplicados.
        if (usuarioId != null) {
            return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
        }
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
        }
        if (inicio != null && fin != null) {
            return ResponseEntity.ok(pedidoService.listarPorRangoDeFecha(inicio, fin));
        }
        // Si no hay filtros, devuelve todos los pedidos.
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    /**
     * Obtiene una lista paginada de pedidos, útil para no cargar grandes cantidades de datos de una sola vez.
     * 
     * @param page Número de la página a consultar (empieza en 0).
     * @param size Cantidad de elementos por página.
     */
    @GetMapping("/page")
    public ResponseEntity<Page<PedidoResponse>> listarPaginado(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "0") int page, // Si no se provee un parámetro 'page', asume 0 por defecto.
            @RequestParam(defaultValue = "10") int size) { // Si no se provee 'size', asume 10 por defecto.
        
        // PageRequest.of crea un objeto que maneja la paginación para Spring Data.
        return ResponseEntity.ok(pedidoService.listarTodosPaginado(estado, inicio, fin, PageRequest.of(page, size)));
    }

    /**
     * Obtiene un mapa con el conteo de pedidos agrupados por estado.
     */
    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> obtenerConteos() {
        return ResponseEntity.ok(pedidoService.obtenerConteosPorEstado());
    }

    /**
     * Obtiene estadísticas agregadas que serán mostradas en el panel principal (Dashboard).
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<com.maido.app.dto.DashboardStatsResponse> obtenerEstadisticasDashboard() {
        return ResponseEntity.ok(pedidoService.obtenerEstadisticasDashboard());
    }

    /**
     * Obtiene el detalle de un pedido en particular.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    /**
     * Modifica el estado de un pedido (por ejemplo, pasarlo de "PENDIENTE" a "ENTREGADO").
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> cambiarEstado(
            @PathVariable Long id,
            // En vez de crear un DTO específico para un solo campo, aquí se recibe un Map de pares clave-valor (JSON).
            @RequestBody Map<String, String> body) {
        
        // Se extrae el valor correspondiente a la clave "estado" del JSON recibido.
        String estado = body.get("estado");
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado));
    }
}

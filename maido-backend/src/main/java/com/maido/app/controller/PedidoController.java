package com.maido.app.controller;

import com.maido.app.dto.PedidoRequest;
import com.maido.app.dto.PedidoResponse;
import com.maido.app.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pedidos")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> crear(@RequestBody PedidoRequest request) {
        return ResponseEntity.status(201).body(pedidoService.crearPedido(request));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        if (usuarioId != null) {
            return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
        }
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
        }
        if (inicio != null && fin != null) {
            return ResponseEntity.ok(pedidoService.listarPorRangoDeFecha(inicio, fin));
        }
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        try {
            return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

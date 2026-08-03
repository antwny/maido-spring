package com.maido.app.controller;

import com.maido.app.entity.Categoria;
import com.maido.app.entity.Platillo;
import com.maido.app.exception.ResourceNotFoundException;
import com.maido.app.service.CategoriaService;
import com.maido.app.service.PlatilloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/platillos")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PlatilloController {

    private final PlatilloService platilloService;
    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<Platillo>> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String nombre) {

        if (categoriaId != null) {
            return ResponseEntity.ok(platilloService.listarPorCategoria(categoriaId));
        }
        if (nombre != null && !nombre.isBlank()) {
            return ResponseEntity.ok(platilloService.buscarPorNombre(nombre));
        }
        return ResponseEntity.ok(platilloService.listarTodos());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<Platillo>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(platilloService.listarTodosPaginado(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Platillo> obtenerPorId(@PathVariable Long id) {
        return platilloService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Platillo> crearConImagen(
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam BigDecimal precio,
            @RequestParam Long categoriaId,
            @RequestParam(required = false) MultipartFile imagen) {

        Categoria categoria = categoriaService.obtenerPorId(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", categoriaId));

        String imagenUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            imagenUrl = platilloService.subirImagen(imagen);
        }

        Platillo platillo = Platillo.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .categoria(categoria)
                .imagenUrl(imagenUrl)
                .build();

        return ResponseEntity.status(201).body(platilloService.guardar(platillo));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Platillo> crearConJson(@RequestBody Platillo platillo) {
        return ResponseEntity.status(201).body(platilloService.guardar(platillo));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Platillo> actualizarConImagen(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam BigDecimal precio,
            @RequestParam Long categoriaId,
            @RequestParam(required = false) Boolean disponible,
            @RequestParam(required = false) MultipartFile imagen) {

        Categoria categoria = categoriaService.obtenerPorId(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", categoriaId));

        String imagenUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            imagenUrl = platilloService.subirImagen(imagen);
        }

        Platillo datos = Platillo.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .categoria(categoria)
                .disponible(disponible != null ? disponible : true)
                .imagenUrl(imagenUrl)
                .build();

        return ResponseEntity.ok(platilloService.actualizar(id, datos));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Platillo> actualizarConJson(@PathVariable Long id, @RequestBody Platillo platillo) {
        return ResponseEntity.ok(platilloService.actualizar(id, platillo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        platilloService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> subirImagen(@RequestParam("file") MultipartFile file) {
        String url = platilloService.subirImagen(file);
        return ResponseEntity.ok(url);
    }
}

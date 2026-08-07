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

/**
 * Controlador REST encargado de gestionar los platillos del restaurante.
 * 
 * Rol en la Arquitectura:
 * Representa la interfaz de comunicación (Controlador) para la entidad Platillo.
 * Proporciona métodos para subir imágenes, listar de manera paginada, crear y actualizar.
 */
@RestController
@RequestMapping("/api/v1/platillos")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PlatilloController {

    private final PlatilloService platilloService;
    private final CategoriaService categoriaService;

    /**
     * Lista platillos aplicando filtros opcionales (por categoría o nombre).
     */
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

    /**
     * Devuelve una página de platillos para la vista del cliente.
     */
    @GetMapping("/page")
    public ResponseEntity<Page<Platillo>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(platilloService.listarTodosPaginado(PageRequest.of(page, size)));
    }

    /**
     * Devuelve una página de platillos para la vista administrativa (probablemente incluya inactivos).
     */
    @GetMapping("/admin/page")
    public ResponseEntity<Page<Platillo>> listarPaginadoAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(platilloService.listarTodosAdmin(PageRequest.of(page, size)));
    }

    /**
     * Restaura un platillo que haya sido eliminado de forma lógica (soft delete).
     */
    @PutMapping("/{id}/restaurar")
    public ResponseEntity<Platillo> restaurar(@PathVariable Long id) {
        return ResponseEntity.ok(platilloService.restaurar(id));
    }

    /**
     * Cambia el estado de disponibilidad del platillo (disponible/agotado).
     */
    @PutMapping("/{id}/toggle-disponible")
    public ResponseEntity<Platillo> toggleDisponible(@PathVariable Long id) {
        return ResponseEntity.ok(platilloService.toggleDisponible(id));
    }

    /**
     * Obtiene la información de un platillo mediante su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Platillo> obtenerPorId(@PathVariable Long id) {
        return platilloService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea un nuevo platillo recibiendo datos y un archivo de imagen en la misma petición.
     * 
     * consumes = MediaType.MULTIPART_FORM_DATA_VALUE indica que el cliente no enviará un JSON normal,
     * sino un formulario multipart (FormData) que soporta archivos (como imágenes).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Platillo> crearConImagen(
            // En vez de @RequestBody usamos @RequestParam porque los datos vienen como campos de un formulario.
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam BigDecimal precio,
            @RequestParam Long categoriaId,
            // MultipartFile es la clase de Spring para manejar archivos subidos a través de HTTP.
            @RequestParam(required = false) MultipartFile imagen) {

        // Se verifica que la categoría asignada al platillo exista previamente.
        Categoria categoria = categoriaService.obtenerPorId(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", categoriaId));

        String imagenUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            // Llama al servicio que se encarga de guardar el archivo físicamente o en nube y retorna su URL.
            imagenUrl = platilloService.subirImagen(imagen);
        }

        // Utiliza el patrón Builder (provisto por Lombok @Builder) para construir el objeto de manera fluida.
        Platillo platillo = Platillo.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .categoria(categoria)
                .imagenUrl(imagenUrl)
                .build();

        return ResponseEntity.status(201).body(platilloService.guardar(platillo));
    }

    /**
     * Crea un platillo usando JSON (sin subir imagen).
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Platillo> crearConJson(@RequestBody Platillo platillo) {
        return ResponseEntity.status(201).body(platilloService.guardar(platillo));
    }

    /**
     * Actualiza un platillo utilizando un formulario multipart para permitir el cambio de la imagen.
     */
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

    /**
     * Actualiza un platillo usando JSON (cuando no se cambia la imagen).
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Platillo> actualizarConJson(@PathVariable Long id, @RequestBody Platillo platillo) {
        return ResponseEntity.ok(platilloService.actualizar(id, platillo));
    }

    /**
     * Elimina lógicamente un platillo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        platilloService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Un endpoint independiente solo para subir una imagen y retornar su URL (útil para editores de texto).
     */
    @PostMapping("/upload")
    public ResponseEntity<String> subirImagen(@RequestParam("file") MultipartFile file) {
        String url = platilloService.subirImagen(file);
        return ResponseEntity.ok(url);
    }
}

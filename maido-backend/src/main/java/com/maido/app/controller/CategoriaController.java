package com.maido.app.controller;

import com.maido.app.entity.Categoria;
import com.maido.app.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador REST para la gestión de las Categorías.
 * 
 * ¿Qué es esta clase y su rol en la arquitectura?
 * Es el punto de entrada para las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * de la entidad Categoria. Pertenece a la capa de Presentación/Controladores.
 * Expone la API REST que los clientes pueden consumir.
 */
// Indica que la clase procesa peticiones web y sus métodos devuelven datos (normalmente JSON), no vistas HTML.
@RestController
// Define la URL base para este controlador.
@RequestMapping("/api/v1/categorias")
// Habilita las solicitudes desde el frontend local.
@CrossOrigin(origins = "http://localhost:4200")
// Genera el constructor para inyectar la dependencia "categoriaService".
@RequiredArgsConstructor
public class CategoriaController {

    // Dependencia del servicio que contiene la lógica de negocio para las categorías.
    private final CategoriaService categoriaService;

    /**
     * Obtiene una lista de todas las categorías activas.
     */
    // @GetMapping mapea peticiones HTTP GET. Como no tiene ruta adicional, responde a la ruta base ("/api/v1/categorias").
    @GetMapping
    public ResponseEntity<List<Categoria>> listar() {
        // Retorna HTTP 200 OK y la lista de categorías generada por el servicio en formato JSON.
        return ResponseEntity.ok(categoriaService.listarActivas());
    }

    /**
     * Obtiene una lista de TODAS las categorías, sin importar si están activas o no.
     */
    // Mapea la petición a la ruta "/api/v1/categorias/todas".
    @GetMapping("/todas")
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    /**
     * Busca y obtiene una categoría específica mediante su ID.
     * 
     * @param id El identificador único de la categoría.
     */
    @GetMapping("/{id}")
    // @PathVariable vincula el "{id}" de la URL al parámetro Long id del método.
    public ResponseEntity<Categoria> obtenerPorId(@PathVariable Long id) {
        // obtenerPorId devuelve un Optional<Categoria>.
        return categoriaService.obtenerPorId(id)
                // Si la categoría existe (está presente), mapeamos el objeto a un ResponseEntity con estado HTTP 200 (OK).
                .map(ResponseEntity::ok)
                // Si el Optional está vacío (no existe el ID), devolvemos un HTTP 404 Not Found.
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea una nueva categoría.
     * 
     * @param categoria El objeto categoría a crear, que viene en formato JSON.
     */
    // @PostMapping maneja peticiones HTTP POST, típicamente para creación de recursos.
    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        // Llama al servicio para guardar la categoría y retorna HTTP 201 Created con el objeto ya persistido.
        return ResponseEntity.status(201).body(categoriaService.guardar(categoria));
    }

    /**
     * Actualiza la información de una categoría existente.
     * 
     * @param id ID de la categoría a modificar.
     * @param categoria Los nuevos datos de la categoría.
     */
    // @PutMapping maneja peticiones HTTP PUT para actualización total del recurso.
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        // Retorna HTTP 200 OK con la categoría actualizada.
        return ResponseEntity.ok(categoriaService.actualizar(id, categoria));
    }

    /**
     * Elimina (o desactiva, dependiendo de la lógica de negocio) una categoría.
     * 
     * @param id ID de la categoría a eliminar.
     */
    // @DeleteMapping se utiliza para peticiones HTTP DELETE.
    @DeleteMapping("/{id}")
    // ResponseEntity<Void> se usa cuando no vamos a devolver un cuerpo en la respuesta.
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Ejecuta la acción de eliminar.
        categoriaService.eliminar(id);
        // Devuelve HTTP 204 No Content, que indica que la operación fue exitosa pero no hay datos que devolver.
        return ResponseEntity.noContent().build();
    }
}

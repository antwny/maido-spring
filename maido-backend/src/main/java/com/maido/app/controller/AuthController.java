package com.maido.app.controller;

import com.maido.app.dto.LoginRequest;
import com.maido.app.dto.LoginResponse;
import com.maido.app.dto.RegisterRequest;
import com.maido.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para manejar la autenticación y registro de usuarios.
 * 
 * ¿Qué es esta clase y su rol en la arquitectura?
 * En el patrón MVC (Modelo-Vista-Controlador), esta clase actúa como un Controlador.
 * Se encarga de recibir las peticiones HTTP del cliente (como un navegador o una aplicación móvil),
 * validar los datos de entrada, llamar a la capa de servicios (AuthService) para procesar la lógica de negocio
 * y devolver una respuesta HTTP adecuada.
 */
// @RestController indica que esta clase es un controlador REST. 
// Es una combinación de @Controller y @ResponseBody, lo que significa que
// cada método devolverá un objeto que se convertirá automáticamente a JSON.
@RestController
// @RequestMapping define la ruta base (URL) para todos los endpoints (métodos) de este controlador.
@RequestMapping("/api/v1/auth")
// @CrossOrigin permite que aplicaciones desde el origen especificado (como Angular en localhost:4200) 
// puedan hacer peticiones a este controlador evitando errores de CORS (Cross-Origin Resource Sharing).
@CrossOrigin(origins = "http://localhost:4200")
// @RequiredArgsConstructor es de la librería Lombok. Genera automáticamente un constructor
// con argumentos para todos los campos declarados como "final", facilitando la inyección de dependencias.
@RequiredArgsConstructor
public class AuthController {

    // Dependencia del servicio de autenticación. Se inyecta automáticamente gracias a @RequiredArgsConstructor.
    private final AuthService authService;

    /**
     * Endpoint para iniciar sesión.
     * 
     * @param request Datos de inicio de sesión (usuario y contraseña).
     * @return ResponseEntity con la respuesta de inicio de sesión.
     */
    // @PostMapping indica que este método maneja peticiones HTTP POST a la ruta "/login".
    @PostMapping("/login")
    // ResponseEntity es una clase de Spring que representa toda la respuesta HTTP:
    // código de estado, cabeceras y el cuerpo (body). Esto nos da control total sobre lo que enviamos al cliente.
    // @RequestBody indica que Spring debe tomar el cuerpo de la petición (JSON) y convertirlo al objeto LoginRequest.
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Llamamos a la capa de servicio para que procese el inicio de sesión.
        LoginResponse response = authService.login(request);
        
        // Verificamos si la autenticación fue exitosa.
        if (response.isAutenticado()) {
            // Retorna un HTTP 200 OK junto con el objeto de respuesta en JSON.
            return ResponseEntity.ok(response);
        }
        // Retorna un HTTP 401 Unauthorized indicando que las credenciales no son válidas.
        return ResponseEntity.status(401).body(response);
    }

    /**
     * Endpoint para registrar un nuevo usuario.
     * 
     * @param request Datos del nuevo usuario a registrar.
     * @return ResponseEntity con la respuesta del registro.
     */
    @PostMapping("/register")
    // @Valid le dice a Spring que ejecute las validaciones definidas en la clase RegisterRequest (ej. @NotBlank, @Email)
    // antes de ejecutar este método. Si falla, devolverá un error automáticamente.
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Llama al servicio para registrar al usuario.
        LoginResponse response = authService.register(request);
        
        if (response.isAutenticado()) {
            // Retorna HTTP 201 Created indicando que el recurso (usuario) se creó correctamente.
            return ResponseEntity.status(201).body(response);
        }
        // Retorna HTTP 400 Bad Request si hubo un problema (ej. el correo ya existe).
        return ResponseEntity.status(400).body(response);
    }

    /**
     * Endpoint para actualizar el perfil de un usuario existente.
     * 
     * @param id ID del usuario a actualizar, obtenido de la URL.
     * @param request Datos nuevos para el usuario.
     * @return ResponseEntity con la información actualizada.
     */
    // @PutMapping se usa para manejar peticiones HTTP PUT, normalmente utilizadas para actualizar recursos existentes.
    @PutMapping("/perfil/{id}")
    // @PathVariable le indica a Spring que extraiga el valor "{id}" de la URL y lo asigne al parámetro "id".
    public ResponseEntity<LoginResponse> updateProfile(@PathVariable Long id, @Valid @RequestBody com.maido.app.dto.UsuarioUpdateRequest request) {
        // Llama al servicio para actualizar los datos.
        LoginResponse response = authService.updateProfile(id, request);
        // Devuelve HTTP 200 OK con el perfil actualizado.
        return ResponseEntity.ok(response);
    }
}

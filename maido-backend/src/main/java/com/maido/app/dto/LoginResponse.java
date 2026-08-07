package com.maido.app.dto;

import lombok.*;

/**
 * Patrón DTO (Data Transfer Object) para respuestas (Response).
 * Cuando el login es exitoso, retornamos este objeto.
 * Fíjate cómo NO enviamos el "password" de vuelta al cliente. Si retornáramos 
 * la Entidad Usuario completa, estaríamos enviando el hash de la contraseña por la red (muy peligroso).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String direccion;
    private String telefono;
    private String mensaje;
    private boolean autenticado;
}

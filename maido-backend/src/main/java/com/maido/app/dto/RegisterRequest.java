package com.maido.app.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

/**
 * Patrón DTO (Data Transfer Object) con Validaciones (Bean Validation).
 * Aquí usamos anotaciones de validación para garantizar que los datos del cliente sean correctos
 * ANTES de que lleguen a nuestra lógica de negocio.
 * Si alguna regla falla, Spring lanzará una MethodArgumentNotValidException,
 * la cual será capturada por nuestro GlobalExceptionHandler.
 */
@Data
public class RegisterRequest {

    // @NotBlank asegura que el campo no sea nulo ni esté vacío (solo espacios).
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    // @Email valida automáticamente el formato (ej. texto@dominio.com).
    @Email(message = "Email inválido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    // @Size restringe la longitud de la cadena.
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private String telefono;
    private String direccion;
}

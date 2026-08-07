package com.maido.app.dto;

import lombok.Data;

/**
 * Patrón DTO (Data Transfer Object) para peticiones de entrada (Request).
 * Captura específicamente los datos necesarios para realizar un login.
 * Solo necesitamos el correo y la contraseña, sin exponer toda la entidad Usuario.
 */
@Data
public class LoginRequest {
    private String email;
    private String password;
}

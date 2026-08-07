package com.maido.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Patrón DTO para operaciones de actualización.
 * A diferencia del registro o la Entidad, para actualizar no permitimos modificar el email ni el password aquí,
 * previniendo ataques de inyección masiva de datos (Mass Assignment).
 * Las validaciones (@NotBlank) protegen la integridad de los datos.
 */
@Data
public class UsuarioUpdateRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    private String telefono;
    private String direccion;
}

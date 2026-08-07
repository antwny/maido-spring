package com.maido.app.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Patrón DTO aplicado al manejo de errores.
 * En lugar de retornar un HTML feo o un stack trace (trazas de código) al cliente,
 * encapsulamos el error en esta estructura JSON amigable y estándar.
 * @JsonInclude(JsonInclude.Include.NON_NULL) hace que los campos nulos (como "errores" si está vacío)
 * no se incluyan en el JSON final.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int codigo;         // Ej: 400, 404, 500
    private String estado;      // Ej: NOT_FOUND, BAD_REQUEST
    private String mensaje;     // Ej: "Usuario no encontrado"
    private LocalDateTime timestamp; // Cuándo ocurrió el error
    private List<FieldError> errores; // Lista de errores de validación de campos

    /**
     * DTO interno para mapear errores específicos por campo (ej: para @NotBlank).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String campo;
        private String mensaje;
    }
}

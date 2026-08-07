package com.maido.app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Centralización del Manejo de Excepciones.
 * @RestControllerAdvice intercepta las excepciones (errores) lanzadas desde cualquier controlador
 * en la aplicación ANTES de que lleguen al frontend.
 * En lugar de retornar el stack trace (el error crudo de Java que rompe el frontend y expone vulnerabilidades),
 * capturamos la excepción y devolvemos un DTO limpio (`ErrorResponse`) con un código HTTP apropiado.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * @ExceptionHandler le dice a Spring: "Si ves que se lanza una ResourceNotFoundException,
     * no te caigas, ejecuta este método".
     * Devuelve un 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .codigo(404)
                .estado("NOT_FOUND")
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Maneja las excepciones de reglas de negocio (ej. "Stock insuficiente").
     * Retorna un 400 Bad Request.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .codigo(400)
                .estado("BAD_REQUEST")
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja los errores de subida de archivos.
     * Retorna un 500 Internal Server Error.
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<ErrorResponse> handleFileUpload(FileUploadException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .codigo(500)
                .estado("UPLOAD_ERROR")
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Este método es CLAVE para capturar los errores de validación de nuestros DTOs
     * (por ejemplo, cuando falla un @NotBlank o @Email).
     * Extrae qué campos fallaron y formatea la respuesta en una lista de "FieldErrors".
     * Devuelve un 422 Unprocessable Entity.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ErrorResponse.FieldError.builder()
                        .campo(fe.getField())
                        .mensaje(fe.getDefaultMessage())
                        .build())
                .toList();

        ErrorResponse error = ErrorResponse.builder()
                .codigo(422)
                .estado("VALIDATION_ERROR")
                .mensaje("Error de validación en los datos enviados")
                .timestamp(LocalDateTime.now())
                .errores(fieldErrors)
                .build();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    /**
     * El comodín (Fallback). Atrapa cualquier otra excepción no controlada
     * (por ejemplo, NullPointerException o fallo de conexión a BD).
     * Evita que el servidor colapse abruptamente de cara al cliente.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .codigo(500)
                .estado("INTERNAL_ERROR")
                .mensaje("Error interno del servidor. Por favor intenta más tarde.")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

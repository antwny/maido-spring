package com.maido.app.exception;

/**
 * Excepción Personalizada.
 * Hereda de RuntimeException.
 * Se utiliza comúnmente en servicios cuando un ID buscado en la base de datos
 * no existe (ej. findById(99) retorna Optional.empty).
 * El GlobalExceptionHandler la interceptará y devolverá un HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String recurso, Long id) {
        super(recurso + " no encontrado con id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

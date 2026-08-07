package com.maido.app.exception;

/**
 * Excepción Personalizada para Reglas de Negocio.
 * Hereda de RuntimeException (Unchecked Exception), por lo que no nos obliga
 * a usar bloques try-catch o firmas "throws" en todo nuestro código.
 * Se lanza cuando ocurre algo que viola la lógica (ej: "No hay stock", "El email ya existe").
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

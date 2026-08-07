package com.maido.app.exception;

/**
 * Excepción Personalizada.
 * Hereda de RuntimeException.
 * Usada específicamente cuando hay un problema guardando o leyendo archivos (como imágenes).
 */
public class FileUploadException extends RuntimeException {
    public FileUploadException(String message) {
        super(message);
    }

    public FileUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}

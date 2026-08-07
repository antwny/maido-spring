package com.maido.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

/**
 * Configuración web adicional para Spring MVC.
 * Al implementar WebMvcConfigurer podemos personalizar cómo Spring maneja 
 * las peticiones web y los recursos estáticos.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // @Value lee una propiedad del archivo application.properties.
    // Si no la encuentra, usa "uploads/" como valor por defecto.
    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    /**
     * Este método nos permite servir archivos estáticos (como imágenes) 
     * que están guardados en una carpeta del disco duro, 
     * y hacerlos accesibles a través de una URL.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        
        // Si alguien pide una URL que empiece con "/uploads/...",
        // Spring buscará el archivo en la ruta física definida por "absolutePath".
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);
    }
}

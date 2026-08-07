package com.maido.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

/**
 * ¡Clase de Configuración! ⚙️
 * 
 * La anotación @Configuration le dice a Spring que esta clase no es un controlador 
 * ni un repositorio, sino un archivo que contiene definiciones de beans de configuración 
 * que se inicializarán al arrancar la aplicación.
 */
@Configuration
public class CorsConfig {

    /**
     * ¿Qué es CORS? 🌐 (Cross-Origin Resource Sharing)
     * Por seguridad, los navegadores bloquean las peticiones que una página web (por ejemplo, 
     * en http://localhost:4200 - Frontend Angular) hace a un servidor diferente 
     * (por ejemplo, http://localhost:8080 - Backend Spring Boot).
     * 
     * Este @Bean "CorsFilter" le dice a nuestro backend que está bien aceptar peticiones 
     * que vengan desde nuestro frontend en Angular.
     * 
     * @Bean indica que el objeto devuelto por este método debe registrarse en el 
     * contenedor de Spring para que sea utilizado por toda la aplicación.
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitimos que nuestro frontend en Angular (localhost:4200) nos haga peticiones.
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        
        // Qué tipos de peticiones HTTP permitimos (GET para leer, POST para crear, etc.)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Permitimos cualquier encabezado (headers) en la petición
        config.setAllowedHeaders(List.of("*"));
        
        // Permitimos enviar credenciales como cookies o tokens de autenticación
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicamos esta regla de CORS a todos los endpoints de nuestra API (/api/**) 
        // y a nuestras imágenes (/uploads/**)
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/uploads/**", config);

        return new CorsFilter(source);
    }
}

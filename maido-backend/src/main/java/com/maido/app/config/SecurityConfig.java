package com.maido.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de Seguridad de nuestra aplicación.
 * @EnableWebSecurity le dice a Spring que active la seguridad web y utilice esta clase.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * BCryptPasswordEncoder es el algoritmo estándar de la industria para hashear contraseñas.
     * Convierte la contraseña en texto plano a una cadena encriptada (hash) 
     * mediante la adición de "salt" (sal) para prevenir ataques de diccionario.
     * 
     * Al usar @Bean, dejamos este encoder disponible para que cualquier parte de la app 
     * lo pueda inyectar cuando necesite encriptar algo o verificar una contraseña.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * SecurityFilterChain es el filtro principal de seguridad.
     * Aquí definimos las reglas de juego: ¿quién puede entrar a qué lugar?
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Habilitamos la configuración de CORS que definimos en CorsConfig.java
            .cors(cors -> cors.configure(http))
            
            // Deshabilitamos CSRF porque normalmente en APIs REST (que usan tokens) no es necesario
            .csrf(csrf -> csrf.disable())
            
            // Le decimos a Spring que no guarde sesiones en memoria (STATELESS). 
            // Cada petición debe ser independiente, algo muy común en APIs REST modernas.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
            // Definimos qué rutas están protegidas y cuáles no
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos a los que cualquiera puede acceder sin iniciar sesión
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/platillos/**",
                    "/api/v1/categorias/**",
                    "/uploads/**",
                    "/error"
                ).permitAll()
                
                // IMPORTANTE: Por ahora dejamos que TODAS las peticiones pasen libremente
                // para facilitar el desarrollo, pero en producción deberíamos pedir 
                // autenticación (.authenticated()) o roles específicos (.hasRole("ADMIN")).
                .anyRequest().permitAll()
            );

        return http.build();
    }
}

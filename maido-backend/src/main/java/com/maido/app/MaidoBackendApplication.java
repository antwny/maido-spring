package com.maido.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ¡Hola estudiante! 👋 Bienvenido al punto de entrada de nuestra aplicación Spring Boot.
 * 
 * La anotación @SpringBootApplication es en realidad una "súper anotación" que combina tres cosas:
 * 1. @Configuration: Indica que esta clase contiene definiciones de beans de Spring.
 * 2. @EnableAutoConfiguration: Le dice a Spring Boot que configure automáticamente tu aplicación basándose 
 *    en las dependencias que tienes en tu archivo pom.xml (por ejemplo, si tienes spring-boot-starter-web, 
 *    configurará Tomcat y Spring MVC automáticamente).
 * 3. @ComponentScan: Le dice a Spring que busque otros componentes, configuraciones y servicios en 
 *    el paquete actual (com.maido.app) y sus subpaquetes.
 */
@SpringBootApplication
public class MaidoBackendApplication {

	public static void main(String[] args) {
		/*
		 * SpringApplication.run() es el método que arranca toda la aplicación.
		 * ¿Qué hace internamente?
		 * 1. Crea el contexto de la aplicación (ApplicationContext).
		 * 2. Examina las clases, crea los beans y los inyecta donde se necesiten (Inyección de Dependencias).
		 * 3. ¡Inicia el servidor web embebido! (Por defecto, Apache Tomcat). 
		 *    Gracias a esto no necesitamos instalar Tomcat por separado, ya viene dentro de nuestra app.
		 */
		SpringApplication.run(MaidoBackendApplication.class, args);
	}

}

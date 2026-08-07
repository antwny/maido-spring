package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ¡Bienvenido a la Entidad Usuario! 📚
 * Recuerda: El ORM (Object-Relational Mapping) es la técnica que nos permite
 * interactuar con la base de datos usando objetos Java en lugar de SQL puro.
 * Hibernate es el "motor" detrás de escena que hace esta magia, traduciendo
 * nuestro código Java a sentencias SQL (INSERT, UPDATE, SELECT, DELETE).
 */
@Entity // ¡No lo olvides! Esta anotación es obligatoria para que Hibernate reconozca la clase.
@Table(name = "usuarios") // Mapea esta clase a la tabla "usuarios" en la base de datos.
// Anotaciones mágicas de Lombok para mantener nuestro código limpio y libre de getters/setters manuales:
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class Usuario {

    @Id // Marca este campo como la clave primaria (PK).
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID auto-incremental gestionado por la base de datos.
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    // Aquí aseguramos que el correo sea único (unique = true), 
    // nadie podrá registrarse dos veces con el mismo email.
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(length = 255) // Por defecto, si no ponemos length, JPA asume 255 (VARCHAR(255)).
    private String direccion;

    // Se asigna un valor por defecto (ROLE_CLIENTE) para nuevos usuarios.
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String rol = "ROLE_CLIENTE"; // ROLE_ADMIN | ROLE_CLIENTE

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String rol = "ROLE_CLIENTE"; // ROLE_ADMIN | ROLE_CLIENTE

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

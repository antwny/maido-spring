package com.maido.app.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String direccion;
    private String telefono;
    private String mensaje;
    private boolean autenticado;
}

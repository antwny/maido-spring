package com.maido.app.service;

import com.maido.app.dto.LoginRequest;
import com.maido.app.dto.LoginResponse;
import com.maido.app.dto.RegisterRequest;
import com.maido.app.dto.UsuarioUpdateRequest;

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Este archivo es una Interfaz (Interface). 
 * En el patrón de diseño de la Capa de Servicios, una Interfaz define "QUÉ" puede hacer un servicio, 
 * sin decir "CÓMO" lo hace. Actúa como un contrato.
 * Ventajas:
 * 1. Desacoplamiento: Otras clases (como los Controladores) dependen de esta interfaz, no de la implementación real.
 * 2. Facilita el Testing: Podemos crear "Mocks" (simulaciones) de esta interfaz para pruebas unitarias.
 */
public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
    LoginResponse updateProfile(Long id, UsuarioUpdateRequest request);
}

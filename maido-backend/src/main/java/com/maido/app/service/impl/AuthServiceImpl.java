package com.maido.app.service.impl;

import com.maido.app.dto.LoginRequest;
import com.maido.app.dto.LoginResponse;
import com.maido.app.dto.RegisterRequest;
import com.maido.app.entity.Usuario;
import com.maido.app.repository.UsuarioRepository;
import com.maido.app.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest request) {
        return usuarioRepository.findByEmail(request.getEmail())
                .filter(u -> u.getActivo())
                .map(u -> {
                    if (passwordEncoder.matches(request.getPassword(), u.getPassword())) {
                        return LoginResponse.builder()
                                .id(u.getId())
                                .nombre(u.getNombre())
                                .apellido(u.getApellido())
                                .email(u.getEmail())
                                .rol(u.getRol())
                                .direccion(u.getDireccion())
                                .telefono(u.getTelefono())
                                .autenticado(true)
                                .mensaje("Bienvenido, " + u.getNombre())
                                .build();
                    }
                    return LoginResponse.builder()
                            .autenticado(false)
                            .mensaje("Credenciales inválidas")
                            .build();
                })
                .orElse(LoginResponse.builder()
                        .autenticado(false)
                        .mensaje("Usuario no encontrado")
                        .build());
    }

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return LoginResponse.builder()
                    .autenticado(false)
                    .mensaje("El email ya está registrado")
                    .build();
        }

        Usuario nuevo = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telefono(request.getTelefono() != null ? request.getTelefono() : "")
                .direccion(request.getDireccion())
                .rol("ROLE_CLIENTE")
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);

        return LoginResponse.builder()
                .id(guardado.getId())
                .nombre(guardado.getNombre())
                .apellido(guardado.getApellido())
                .email(guardado.getEmail())
                .rol(guardado.getRol())
                .direccion(guardado.getDireccion())
                .telefono(guardado.getTelefono())
                .autenticado(true)
                .mensaje("Registro exitoso. Bienvenido a Maido!")
                .build();
    }
}

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

/**
 * 🎓 EXPLICACIÓN PARA EL ESTUDIANTE:
 * Esta clase es la Implementación ("CÓMO") de la interfaz AuthService.
 *
 * @Service: Esta anotación le dice a Spring Boot que esta clase es un Bean de Servicio.
 * Spring la instanciará automáticamente y la guardará en su "Contenedor de Inversión de Control (IoC)".
 * 
 * @RequiredArgsConstructor: Es una anotación de Lombok que crea automáticamente un constructor
 * con todos los atributos marcados como 'final'. Esto se usa para la Inyección de Dependencias
 * por Constructor, la cual es la práctica más recomendada en Spring moderna (mejor que usar @Autowired 
 * en las variables), porque facilita el testing y asegura que las dependencias no sean nulas.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    // Dependencias inyectadas por el constructor generado por @RequiredArgsConstructor
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest request) {
        // Uso de Optional y Lambdas (Java 8+)
        // findByEmail retorna un Optional<Usuario>
        return usuarioRepository.findByEmail(request.getEmail())
                // .filter() recibe un Predicate (una lambda que devuelve boolean). 
                // Sólo deja pasar si el usuario está activo.
                .filter(u -> u.getActivo())
                // .map() transforma el contenido del Optional. Recibe el usuario, y lo transforma a un LoginResponse.
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
                // .orElse() se ejecuta si el Optional está vacío (ej. el usuario no existe o no estaba activo).
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

    @Override
    public LoginResponse updateProfile(Long id, com.maido.app.dto.UsuarioUpdateRequest request) {
        return usuarioRepository.findById(id).map(u -> {
            u.setNombre(request.getNombre());
            u.setApellido(request.getApellido());
            u.setTelefono(request.getTelefono());
            u.setDireccion(request.getDireccion());
            Usuario guardado = usuarioRepository.save(u);
            return LoginResponse.builder()
                    .id(guardado.getId())
                    .nombre(guardado.getNombre())
                    .apellido(guardado.getApellido())
                    .email(guardado.getEmail())
                    .rol(guardado.getRol())
                    .direccion(guardado.getDireccion())
                    .telefono(guardado.getTelefono())
                    .autenticado(true)
                    .mensaje("Perfil actualizado exitosamente")
                    .build();
        // .orElseThrow() es muy útil: extrae el valor del Optional si existe, 
        // pero si está vacío, lanza inmediatamente la excepción que le digamos.
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}

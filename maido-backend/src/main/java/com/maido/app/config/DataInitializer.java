package com.maido.app.config;

import com.maido.app.entity.Categoria;
import com.maido.app.entity.Platillo;
import com.maido.app.entity.Usuario;
import com.maido.app.repository.CategoriaRepository;
import com.maido.app.repository.PlatilloRepository;
import com.maido.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * ¡El Inicializador de Datos! 🚀
 * 
 * Al implementar 'CommandLineRunner', Spring ejecutará automáticamente el método 'run()' 
 * justo después de que la aplicación haya arrancado por completo.
 * Esto es súper útil para insertar datos de prueba o iniciales en la base de datos (Semillas/Seeds).
 */
@Component
@RequiredArgsConstructor
@Slf4j // Anotación de Lombok para habilitar el registro de logs (log.info, etc.)
public class DataInitializer implements CommandLineRunner {

    // Inyectamos nuestros repositorios. Gracias a @RequiredArgsConstructor (de Lombok)
    // Spring genera un constructor automáticamente y hace la inyección de dependencias.
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PlatilloRepository platilloRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initUsuarios();
        initCategorias();
        initPlatillos();
        log.info("✅ Maido - Datos iniciales cargados correctamente.");
    }

    private void initUsuarios() {
        // Solo guardamos usuarios si la tabla está vacía
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(Usuario.builder()
                    .nombre("Admin")
                    .apellido("Maido")
                    .email("admin@maido.pe")
                    // ¡Nunca guardes contraseñas en texto plano! Usamos el encoder aquí.
                    .password(passwordEncoder.encode("admin123"))
                    .telefono("999000001")
                    .direccion("Av. La Mar 700, Miraflores")
                    .rol("ROLE_ADMIN")
                    .activo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nombre("Kenji")
                    .apellido("Fujimoto")
                    .email("kenji@cliente.pe")
                    .password(passwordEncoder.encode("cliente123"))
                    .telefono("999000002")
                    .direccion("Jr. Ebisu 150, San Isidro")
                    .rol("ROLE_CLIENTE")
                    .activo(true)
                    .build());

            log.info("👤 Usuarios de prueba creados: admin@maido.pe / admin123");
        }
    }

    private void initCategorias() {
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(Categoria.builder().nombre("Nikkei").descripcion("Fusión peruano-japonesa").build());
            categoriaRepository.save(Categoria.builder().nombre("Ceviches").descripcion("Clásicos del mar peruano").build());
            categoriaRepository.save(Categoria.builder().nombre("Tiraditos").descripcion("Inspiración japonesa sobre el mar").build());
            categoriaRepository.save(Categoria.builder().nombre("Sushi Nikkei").descripcion("Rolls y nigiris con toque peruano").build());
            categoriaRepository.save(Categoria.builder().nombre("Causas").descripcion("Papa peruana reinventada").build());
            categoriaRepository.save(Categoria.builder().nombre("Postres").descripcion("Dulces de fusión").build());
            categoriaRepository.save(Categoria.builder().nombre("Bebidas").descripcion("Cócteles y sin alcohol").build());
            log.info("📂 Categorías Nikkei creadas.");
        }
    }

    private void initPlatillos() {
        if (platilloRepository.count() == 0) {
            Categoria nikkei = categoriaRepository.findByActivoTrue().stream()
                    .filter(c -> c.getNombre().equals("Nikkei")).findFirst().orElse(null);
            Categoria ceviches = categoriaRepository.findByActivoTrue().stream()
                    .filter(c -> c.getNombre().equals("Ceviches")).findFirst().orElse(null);
            Categoria sushi = categoriaRepository.findByActivoTrue().stream()
                    .filter(c -> c.getNombre().equals("Sushi Nikkei")).findFirst().orElse(null);
            Categoria postres = categoriaRepository.findByActivoTrue().stream()
                    .filter(c -> c.getNombre().equals("Postres")).findFirst().orElse(null);
            Categoria bebidas = categoriaRepository.findByActivoTrue().stream()
                    .filter(c -> c.getNombre().equals("Bebidas")).findFirst().orElse(null);

            if (nikkei != null) {
                platilloRepository.save(Platillo.builder()
                        .nombre("Lomo Saltado Nikkei")
                        .descripcion("Lomo fino saltado con salsa ponzu, tomate cherry y papa confitada")
                        .precio(new BigDecimal("78.00"))
                        .categoria(nikkei)
                        .imagenUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400")
                        .build());

                platilloRepository.save(Platillo.builder()
                        .nombre("Arroz con Mariscos Nikkei")
                        .descripcion("Arroz cremoso con pulpo, langostinos y salsa de ají amarillo y miso")
                        .precio(new BigDecimal("85.00"))
                        .categoria(nikkei)
                        .imagenUrl("https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400")
                        .build());
            }

            if (ceviches != null) {
                platilloRepository.save(Platillo.builder()
                        .nombre("Ceviche Clásico Maido")
                        .descripcion("Lenguado fresco, leche de tigre de yuzu, cebolla morada, choclo y camote")
                        .precio(new BigDecimal("72.00"))
                        .categoria(ceviches)
                        .imagenUrl("https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400")
                        .build());

                platilloRepository.save(Platillo.builder()
                        .nombre("Ceviche de Pato Nikkei")
                        .descripcion("Pato confitado, leche de tigre de ají limo y jengibre, cilantro")
                        .precio(new BigDecimal("68.00"))
                        .categoria(ceviches)
                        .imagenUrl("https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400")
                        .build());
            }

            if (sushi != null) {
                platilloRepository.save(Platillo.builder()
                        .nombre("Roll Maido Signature")
                        .descripcion("Langosta, aguacate, pepino, cubierto con salmón y salsa anticuchera")
                        .precio(new BigDecimal("95.00"))
                        .categoria(sushi)
                        .imagenUrl("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400")
                        .build());

                platilloRepository.save(Platillo.builder()
                        .nombre("Nigiri Andino")
                        .descripcion("Atún sellado, quinoa crocante, pasta de rocoto y acevichado")
                        .precio(new BigDecimal("62.00"))
                        .categoria(sushi)
                        .imagenUrl("https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400")
                        .build());
            }

            if (postres != null) {
                platilloRepository.save(Platillo.builder()
                        .nombre("Chocolate Nikkei")
                        .descripcion("Coulant de chocolate al 70%, helado de lúcuma y mochi de maracuyá")
                        .precio(new BigDecimal("42.00"))
                        .categoria(postres)
                        .imagenUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400")
                        .build());
            }

            if (bebidas != null) {
                platilloRepository.save(Platillo.builder()
                        .nombre("Pisco Sour Clásico")
                        .descripcion("Pisco quebranta, limón, clara de huevo y amargo de angostura")
                        .precio(new BigDecimal("38.00"))
                        .categoria(bebidas)
                        .imagenUrl("https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400")
                        .build());

                platilloRepository.save(Platillo.builder()
                        .nombre("Yuzu Sour")
                        .descripcion("Pisco acholado, yuzu fresco, jarabe de jengibre y espuma de albahaca")
                        .precio(new BigDecimal("42.00"))
                        .categoria(bebidas)
                        .imagenUrl("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400")
                        .build());
            }

            log.info("🍣 Platillos de ejemplo cargados.");
        }
    }
}

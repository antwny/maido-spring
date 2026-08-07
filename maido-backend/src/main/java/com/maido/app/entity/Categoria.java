package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ¡Hola estudiante! 👋 
 * Esta es una clase 'Entidad' (Entity). En el mundo del desarrollo con Spring Boot, 
 * una entidad representa una tabla en nuestra base de datos relacional (como MySQL o PostgreSQL).
 * Estamos utilizando JPA (Java Persistence API) junto con Hibernate (su implementación más popular)
 * para realizar ORM (Object-Relational Mapping). Esto significa que mapeamos nuestros objetos de Java
 * directamente a tablas de la base de datos, ¡sin tener que escribir consultas SQL a mano!
 */
@Entity // Indica a JPA que esta clase es una Entidad y debe ser mapeada a una tabla en la BD.
@Table(name = "categorias") // (Opcional pero recomendado) Permite especificar el nombre exacto de la tabla en la base de datos.
/* 
 * A continuación vemos anotaciones de Lombok. 
 * Lombok es una librería que en tiempo de compilación genera código repetitivo (boilerplate) por nosotros.
 * ¡Nos ahorra escribir cientos de líneas de código!
 */
@Data // Genera automáticamente getters, setters, equals(), hashCode() y toString() para todos los campos.
@NoArgsConstructor // Genera un constructor vacío (sin argumentos). Requerido por JPA/Hibernate para instanciar la entidad.
@AllArgsConstructor // Genera un constructor con todos los argumentos. Útil para instanciar objetos rápidamente.
@Builder // Implementa el patrón de diseño Builder, permitiendo crear objetos de forma fluida: Categoria.builder().nombre("...").build();
public class Categoria {

    /**
     * @Id: Define que este campo es la Llave Primaria (Primary Key) de la tabla.
     * @GeneratedValue: Le dice a la base de datos que genere automáticamente este valor.
     * strategy = GenerationType.IDENTITY: Usa columnas auto-incrementables (muy común en MySQL).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @Column: Permite configurar las propiedades de la columna en la BD.
     * nullable = false: Corresponde a NOT NULL en SQL.
     * unique = true: Garantiza que no haya dos categorías con el mismo nombre.
     * length = 100: Limita el tamaño del VARCHAR en la base de datos a 100 caracteres.
     */
    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    /**
     * @Builder.Default: Como estamos usando @Builder de Lombok, si queremos que un campo 
     * tenga un valor por defecto al momento de crearlo con el builder, usamos esta anotación.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

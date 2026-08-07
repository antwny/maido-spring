package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Entidad Platillo 🥘
 * Aquí veremos algo nuevo: ¡Relaciones entre tablas!
 * En una base de datos relacional, las tablas se conectan mediante llaves foráneas (Foreign Keys).
 * Con JPA, modelamos estas relaciones directamente en nuestras clases Java.
 */
@Entity
@Table(name = "platillos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Platillo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    // columnDefinition = "TEXT" le dice a Hibernate que use el tipo de dato TEXT (muy largo) 
    // en lugar de VARCHAR(255) en la base de datos.
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // precision = 10, scale = 2 significa: 10 dígitos en total, de los cuales 2 son decimales (ej: 99999999.99)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(length = 500)
    private String imagenUrl;

    /**
     * ¡Atención aquí estudiante! 🚨 Relación Muchos-a-Uno (ManyToOne).
     * Muchos 'Platillos' pueden pertenecer a una sola 'Categoria'.
     * 
     * @ManyToOne: Define la multiplicidad de la relación.
     * fetch = FetchType.EAGER: Significa que cada vez que consultemos un Platillo, 
     * Hibernate también traerá automáticamente la información de su Categoría asociada en la misma consulta (JOIN).
     * Nota: A veces usamos LAZY (perezoso) si no queremos traer el objeto relacionado inmediatamente por rendimiento.
     * 
     * @JoinColumn: Especifica el nombre de la columna en la tabla 'platillos' 
     * que actuará como Llave Foránea (Foreign Key) hacia la tabla 'categorias'.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disponible = true;
}

package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Pedido 📦
 * Esta es una entidad "maestra" o "padre". Un Pedido tiene múltiples Detalles de Pedido.
 * Aquí exploraremos relaciones bidireccionales y el atributo 'mappedBy'.
 */
@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Muchos pedidos pueden ser hechos por un solo usuario. Traemos el usuario al cargar el pedido (EAGER).
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime fechaPedido = LocalDateTime.now();

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE | EN_PREPARACION | EN_CAMINO | ENTREGADO | CANCELADO

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 255)
    private String direccionEntrega;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    /**
     * ¡Tema avanzado! 🚀 Relación Uno-a-Muchos (OneToMany).
     * Un Pedido puede tener MUCHOS 'DetallesPedido' (ej: 2 hamburguesas, 1 refresco).
     * 
     * @OneToMany: Indica que este lado de la relación tiene múltiples elementos.
     * mappedBy = "pedido": ¡MUY IMPORTANTE! Esto le dice a JPA: "La tabla 'pedidos' NO tiene 
     * la llave foránea. La llave foránea está en la entidad 'DetallePedido', en el atributo que se llama 'pedido'".
     * Esto hace que la relación sea bidireccional y evita que Hibernate cree una tabla intermedia innecesaria.
     * 
     * cascade = CascadeType.ALL: Si guardo un Pedido, Hibernate automáticamente guardará todos 
     * los detalles que están en esta lista. Si borro el pedido, se borran sus detalles (eliminación en cascada).
     * 
     * fetch = FetchType.LAZY: Cuando busque un Pedido, NO cargues de inmediato todos sus detalles (es perezoso).
     * Solo los buscará en la base de datos si llamo a `pedido.getDetalles()`. Esto ahorra muchísima memoria.
     */
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetallePedido> detalles = new ArrayList<>();
}

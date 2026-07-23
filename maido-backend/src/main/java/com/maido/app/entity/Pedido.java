package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetallePedido> detalles = new ArrayList<>();
}

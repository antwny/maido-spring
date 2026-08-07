package com.maido.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Entidad DetallePedido 🧾
 * Esta entidad representa una fila en el "recibo" de compra. 
 * Conecta qué platillo se compró, en qué pedido, y cuánta cantidad.
 * Es el lado "hijo" en la relación con Pedido.
 */
@Entity
@Table(name = "detalle_pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Aquí está el lado "dueño" (owner) de la relación con Pedido.
     * Sabemos que es el dueño porque tiene la anotación @JoinColumn, 
     * lo que significa que la tabla 'detalle_pedidos' tendrá físicamente 
     * la columna 'pedido_id' como llave foránea.
     * 
     * fetch = FetchType.LAZY: Como un detalle siempre pertenece a un pedido grande,
     * no necesitamos traer todo el pedido a memoria cada vez que consultamos un detalle.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    // Relación con Platillo. Cuando veamos un detalle, generalmente sí queremos saber
    // qué platillo es, por eso usamos EAGER para cargarlo de inmediato.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "platillo_id", nullable = false)
    private Platillo platillo;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}

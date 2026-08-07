# 🎓 Guía de Sustentación - Proyecto Maido (Spring Boot + Angular)

Esta guía está diseñada para ayudarte a entender la arquitectura, el flujo de datos y las decisiones técnicas clave de tu proyecto. Úsala para prepararte para las preguntas del jurado.

## 1. Arquitectura General del Sistema
El proyecto sigue una arquitectura **Cliente-Servidor (Fullstack)** dividida en dos capas independientes que se comunican a través de una **API REST**:

*   **Backend (Servidor):** Construido con Java 21 y Spring Boot 4.1. Se encarga de la lógica de negocio, acceso a la base de datos (MySQL), seguridad y generación de reportes (JasperReports).
*   **Frontend (Cliente):** Construido con Angular 19. Es una Single Page Application (SPA) que consume la API del backend. Maneja la interfaz de usuario, estado reactivo (RxJS) y validación de formularios.

**Pregunta típica de jurado:** *¿Por qué separar el Frontend del Backend?*
**Respuesta:** Permite escalabilidad independiente, mejor organización del código, y la posibilidad de que en el futuro otros clientes (como una app móvil) consuman la misma API sin reescribir el backend.

---

## 2. El Backend: Spring Boot a Fondo

El backend utiliza una arquitectura multicapa (N-Tier):
1.  **Capa de Controladores (`Controller`):** Reciben las peticiones HTTP (GET, POST, PUT, DELETE), validan los datos de entrada (usando `@Valid`) y delegan el trabajo a los servicios.
2.  **Capa de Servicios (`Service`):** Aquí reside la **lógica de negocio**. Por ejemplo, verificar si hay stock, calcular totales, etc.
3.  **Capa de Acceso a Datos (`Repository`):** Utiliza *Spring Data JPA* para interactuar con MySQL mediante interfaces, sin necesidad de escribir SQL puro (salvo casos específicos).
4.  **Entidades (`Entity`):** Clases Java mapeadas a tablas de la base de datos mediante *Hibernate* (JPA).

### Seguridad y Autenticación (BCrypt)
No usamos JWT explícitamente en la versión base para mantenerlo simple, pero **sí usamos encriptación de contraseñas** con `BCryptPasswordEncoder` (configurado en `SecurityConfig.java`). 
*   Cuando un usuario se registra, su contraseña se hashea (se convierte en un texto ilegible) antes de guardarse en la BD.
*   Cuando inicia sesión, Spring compara el hash generado con el guardado en la BD.

### Manejo de Errores Globales
En lugar de tener bloques `try/catch` en cada controlador, usamos `GlobalExceptionHandler.java` (anotado con `@RestControllerAdvice`). 
*   **¿Para qué sirve?** Captura cualquier excepción lanzada en la aplicación (ej. `ResourceNotFoundException`) y la transforma en una respuesta HTTP JSON estructurada y amigable para el frontend.

---

## 3. El Frontend: Angular 19 a Fondo

El frontend utiliza componentes modernos **Standalone** (sin `app.module.ts`), lo que hace que la aplicación sea más modular y rápida (Lazy Loading).

### Estado Reactivo (RxJS)
El corazón del carrito y la sesión de usuario es **RxJS** (Específicamente `BehaviorSubject`).
*   **¿Qué es un BehaviorSubject?** Es como una variable observable que "recuerda" su último valor. Si un usuario agrega algo al carrito (`cart.service.ts`), el servicio emite el nuevo estado, y el `Navbar` (que está suscrito) se actualiza automáticamente mostrando el número de items sin necesidad de recargar la página.

### Guards de Rutas
Usamos Guards (`auth.guard.ts`, `admin.guard.ts`) para proteger las rutas. 
*   **¿Cómo funcionan?** Antes de que el router de Angular te deje entrar a `/checkout`, el Guard revisa `localStorage` para ver si hay un usuario logueado. Si no lo hay, te redirige al `/login`.

---

## 4. Flujo Completo: ¿Qué pasa cuando el cliente hace un Pedido?

Esta es la explicación que debes dominar para la sustentación. Es el "Happy Path" (Flujo ideal).

1.  **Frontend (Carrito):** El usuario navega al catálogo y presiona "Agregar". El `CartService` añade el platillo a un arreglo en memoria y lo guarda en `localStorage` (para que no se pierda si cierra la pestaña).
2.  **Frontend (Checkout):** El usuario llena sus datos y método de pago (formulario reactivo de Angular). Al darle a "Finalizar", Angular arma un objeto JSON (el DTO) y hace un `POST /api/v1/pedidos` mediante `HttpClient`.
3.  **Backend (PedidoController):** Recibe el JSON, lo valida, y llama a `PedidoServiceImpl.crearPedido()`.
4.  **Backend (PedidoServiceImpl):** 
    *   Este método es **`@Transactional`**. Esto significa que si algo falla a la mitad (ej. un platillo no existe), toda la operación hace "rollback" (se deshace) para que la BD no quede corrupta.
    *   Suma los subtotales, crea la entidad `Pedido` en estado `PENDIENTE`.
    *   Itera sobre los items, crea entidades `DetallePedido` y las asocia al pedido principal.
    *   Guarda todo en MySQL usando el `PedidoRepository`.
5.  **Frontend (Respuesta):** Angular recibe la confirmación (Status 201 Created), limpia el carrito (`CartService.clearCart()`) y redirige al usuario a la vista de éxito mostrando el Recibo Digital.

---

## 5. Decisiones de Diseño (UI/UX)
*   **Glassmorphism:** Se usó para las tarjetas (ej. el Checkout), creando un efecto de vidrio esmerilado con CSS moderno (`backdrop-filter: blur`). Da una apariencia premium.
*   **Skeleton Loaders:** En lugar de spinners de carga tradicionales, se usan "esqueletos" grises animados con CSS. Esto reduce la ansiedad de espera del usuario (percepción psicológica del tiempo).
*   **Soft Delete:** En lugar de borrar platillos o categorías permanentemente de la BD (lo cual rompería el historial de pedidos pasados), usamos un campo `activo = false` para ocultarlos.

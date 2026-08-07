# 🍣 Guía Completa de Sustentación: Proyecto Maido (Spring Boot + Angular)

¡Bienvenido a la guía maestra de sustentación para tu proyecto de Desarrollo de Aplicaciones Web I! Este documento está diseñado en formato Obsidian para que puedas navegarlo fácilmente usando enlaces internos. Aquí encontrarás un desglose exhaustivo de cada tecnología, decisiones arquitectónicas, explicación de código y, lo más importante, un simulador de preguntas de los profesores (Q&A) para que llegues a la presentación con total seguridad.

---

## 📑 Índice
- [[#1. Introducción y Justificación del Proyecto]]
- [[#2. Arquitectura General del Sistema]]
- [[#3. Backend: Spring Boot a Profundidad]]
  - [[#3.1 Conceptos Fundamentales: API REST y RESTful]]
  - [[#3.2 Patrón de Arquitectura por Capas]]
  - [[#3.3 Inyección de Dependencias (IoC)]]
  - [[#3.4 Seguridad: Spring Security y Autenticación Stateless]]
  - [[#3.5 Manejo de Excepciones Global (@RestControllerAdvice)]]
  - [[#3.6 Acceso a Datos: JPA, Hibernate y Entidades]]
- [[#4. Frontend: Angular y TypeScript a Profundidad]]
  - [[#4.1 TypeScript: Tipado Estricto e Interfaces]]
  - [[#4.2 Componentes, Servicios y Módulos]]
  - [[#4.3 Enrutamiento y Guards (Protección de Rutas)]]
  - [[#4.4 Reactividad: RxJS y BehaviorSubject]]
  - [[#4.5 UI/UX y Animaciones]]
- [[#5. Flujos de Código Explicados Paso a Paso]]
  - [[#5.1 Flujo 1: El Proceso de Autenticación (Login)]]
  - [[#5.2 Flujo 2: Creación de un Pedido (Transaccionalidad)]]
- [[#6. Simulación de Preguntas y Respuestas (Q&A de Profesores)]]

---

## 🚀 1. Introducción y Justificación del Proyecto

**¿Qué es Maido?**
Maido es una plataforma web completa de pedidos online para un restaurante de comida Nikkei (fusión peruano-japonesa). El sistema permite a los clientes explorar el catálogo de platillos, gestionar un carrito de compras, realizar pedidos y revisar su historial. Por el lado del negocio, incluye un panel de administración para gestionar el inventario (categorías y platillos), administrar los estados de los pedidos en tiempo real y generar reportes.

**Justificación Técnica:**
El proyecto se ha desarrollado separando completamente el frontend del backend (arquitectura desacoplada). Esta decisión se justifica por varias razones:
- **Escalabilidad:** Permite escalar los servidores de backend independientemente del frontend.
- **Mantenibilidad:** Equipos de frontend y backend pueden trabajar en paralelo sin pisarse los pies.
- **Reusabilidad:** El backend expone una API REST, lo que significa que en el futuro se podría crear una aplicación móvil (Android/iOS) consumiendo exactamente los mismos servicios sin modificar el backend.
- **Modernidad:** Se utilizan las versiones más recientes y demandadas en el mercado (Java 21, Spring Boot 4.1, Angular 19).

---

## 🏗️ 2. Arquitectura General del Sistema

El sistema utiliza una arquitectura **Cliente-Servidor** bajo el modelo de **Single Page Application (SPA)** en el cliente y **API RESTful** en el servidor.

1. **Cliente (Angular 19):** Aplicación que corre en el navegador del usuario. Maneja el enrutamiento interno, el estado de la aplicación (como el carrito de compras) y la interfaz de usuario. Se comunica con el backend mediante peticiones HTTP asíncronas (AJAX vía `HttpClient`).
2. **Servidor (Spring Boot 4.1):** Recibe las peticiones HTTP, valida la seguridad, procesa la lógica de negocio, se comunica con la base de datos y retorna respuestas estructuradas en formato JSON.
3. **Base de Datos (MySQL):** Base de datos relacional donde se almacena de forma persistente toda la información del sistema (usuarios, productos, pedidos).

**Comunicación mediante JSON:**
Toda la información que viaja entre el frontend y el backend está serializada en formato JSON (JavaScript Object Notation). Es el estándar de facto por ser ligero, fácil de leer para humanos y fácil de parsear para las máquinas.

---

## ⚙️ 3. Backend: Spring Boot a Profundidad

En el curso "Desarrollo de Aplicaciones Web I", Spring Boot es el corazón tecnológico. Aquí detallamos los conceptos clave que sostienen el backend.

### 🔌 3.1 Conceptos Fundamentales: API REST y RESTful

**¿Qué es una API?**
Application Programming Interface. Es un conjunto de reglas que permite que dos aplicaciones se comuniquen entre sí.

**¿Qué es REST?**
REpresentational State Transfer. Es un estilo de arquitectura de software para sistemas hipermedia distribuidos. REST establece una serie de restricciones (principios):
- **Cliente-Servidor:** Separación de responsabilidades.
- **Stateless (Sin estado):** El servidor no guarda información de la sesión del cliente entre peticiones. Cada petición debe contener toda la información necesaria para ser procesada.
- **Caché:** Las respuestas deben ser cacheables.
- **Interfaz Uniforme:** Uso estándar de los métodos HTTP y URIs.

**¿Qué significa RESTful?**
Se dice que un servicio web es "RESTful" cuando cumple al 100% con los principios de la arquitectura REST. 
En nuestro proyecto, lo demostramos usando correctamente los **Verbos HTTP** para el CRUD:
- `GET /api/v1/platillos` -> Obtener todos los platillos.
- `GET /api/v1/platillos/{id}` -> Obtener un platillo específico.
- `POST /api/v1/platillos` -> Crear un nuevo platillo.
- `PUT /api/v1/platillos/{id}` -> Actualizar un platillo existente.
- `DELETE /api/v1/platillos/{id}` -> Eliminar un platillo.

**Códigos de Estado HTTP:**
Devolvemos los códigos semánticamente correctos:
- `200 OK`: Petición exitosa.
- `201 Created`: Recurso creado exitosamente (ej. al guardar un pedido).
- `400 Bad Request`: Error en los datos enviados por el cliente.
- `401 Unauthorized`: Usuario no autenticado.
- `403 Forbidden`: Usuario autenticado pero sin permisos (ej. un cliente intentando acceder al admin).
- `404 Not Found`: Recurso no encontrado en la base de datos.
- `500 Internal Server Error`: Error imprevisto en el servidor.

### 🥞 3.2 Patrón de Arquitectura por Capas

El backend de MaidoSpring está estrictamente dividido en capas para asegurar el principio de Responsabilidad Única (SRP - Single Responsibility Principle).

1. **Capa Controller (`@RestController`):**
   - Es la puerta de entrada. Su única responsabilidad es recibir la petición HTTP (Request), extraer los datos (Params, Body), llamar a la capa de servicio, y devolver una respuesta HTTP (Response) con el código de estado adecuado.
   - Anotaciones clave: `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@RequestBody`, `@PathVariable`.

2. **Capa Service (`@Service`):**
   - Es el corazón de la aplicación. Aquí vive la **Lógica de Negocio**. 
   - Se encarga de hacer cálculos, validaciones complejas, aplicar reglas del restaurante (ej. cambiar un estado de pedido) y orquestar llamadas a la base de datos.
   - Las interfaces (`PlatilloService`) y sus implementaciones (`PlatilloServiceImpl`) permiten desacoplar el código y facilitan el Testing.

3. **Capa Repository (`@Repository`):**
   - Interfaz que extiende de `JpaRepository`.
   - Su única responsabilidad es hablar con la Base de Datos. No tiene lógica de negocio. Spring Data JPA genera las consultas SQL automáticamente en tiempo de ejecución.

4. **Capa Entidades (`@Entity`):**
   - Clases de Java que representan las tablas de la base de datos relacional (ORM - Object Relational Mapping).

5. **Capa DTO (Data Transfer Object):**
   - Objetos que se usan para transferir datos entre el cliente y el servidor.
   - **¿Por qué no devolver la Entidad directamente?** Por seguridad y rendimiento. No queremos enviar información confidencial (como la contraseña en la entidad Usuario) ni traer objetos anidados innecesarios que causen problemas de Serialización Cíclica o un sobrepeso en la respuesta JSON. Usamos clases como `PedidoRequest`, `LoginResponse`, etc.

### 💉 3.3 Inyección de Dependencias (IoC)

Spring framework se basa en el principio de **Inversión de Control (IoC)**. Nosotros no instanciamos las clases manualmente usando la palabra reservada `new` (ej. `PlatilloService service = new PlatilloService();`). 
En su lugar, declaro las dependencias en los constructores y el **Contenedor de Spring** se encarga de inyectarlas automáticamente en tiempo de ejecución.
Anotaciones como `@RestController`, `@Service`, `@Repository` le dicen a Spring: *"Crea un Singleton (una única instancia) de esta clase y adminístrala en tu contenedor"*.

### 🛡️ 3.4 Seguridad: Spring Security y Autenticación Stateless

El módulo de seguridad es uno de los más importantes del curso. Nuestro `SecurityConfig` está configurado para proteger las rutas de la API.

**Autenticación vs Autorización:**
- **Autenticación:** Verificar *quién eres* (Login con email y password).
- **Autorización:** Verificar *qué puedes hacer* (Roles: Admin vs Cliente).

**Stateless Security:**
Dado que es una API REST, desactivamos el manejo de sesiones tradicionales por cookies (`SessionCreationPolicy.STATELESS`). 

**BCryptPasswordEncoder:**
Nunca, **NUNCA** guardamos contraseñas en texto plano en la base de datos. Usamos BCrypt, un algoritmo de hashing criptográfico unidireccional (no se puede desencriptar). 
- Cuando el usuario se registra: `bcrypt.encode(password)` -> Guarda un Hash (`$2a$10$...`) en MySQL.
- Cuando hace login: `bcrypt.matches(passwordPlano, hashDeBaseDeDatos)` -> Compara los hashes.

**CORS (Cross-Origin Resource Sharing):**
El frontend (`localhost:4200`) y el backend (`localhost:8080`) están en puertos distintos, lo que para el navegador son "Orígenes diferentes". Por seguridad, el navegador bloquea la comunicación. Configuramos `CorsConfig` en Spring para permitir que `http://localhost:4200` pueda hacer peticiones HTTP sin ser bloqueado.

### 🚫 3.5 Manejo de Excepciones Global (@RestControllerAdvice)

En lugar de llenar los controladores con bloques `try-catch`, hemos implementado un manejador de excepciones centralizado.
La clase `GlobalExceptionHandler` anotada con `@RestControllerAdvice` escucha y atrapa cualquier error lanzado en la aplicación.

- Si el servicio lanza una `ResourceNotFoundException`, el manejador atrapa la excepción y retorna un JSON estandarizado a través de la clase `ErrorResponse` con un código HTTP `404`.
- Si lanza un `BusinessException`, retorna un error `400`.
- Esto garantiza que el Frontend siempre reciba respuestas JSON con la misma estructura, facilitando el manejo de errores en la interfaz.

### 💾 3.6 Acceso a Datos: JPA, Hibernate y Entidades

Utilizamos **JPA (Java Persistence API)**, siendo **Hibernate** su implementación subyacente. Esto nos permite usar el paradigma **ORM (Object-Relational Mapping)**.
En lugar de escribir comandos SQL puro, trabajamos con objetos de Java.
Anotaciones importantes:
- `@Entity`: Marca la clase como persistente.
- `@Table(name="usuarios")`: Mapea la clase a una tabla específica.
- `@Id` y `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Para llaves primarias autoincrementales.
- Relaciones: `@OneToMany`, `@ManyToOne` (ej. Un Pedido tiene muchos DetallePedido).
- `application.properties`: Configuramos `ddl-auto=update` para que Hibernate gestione la estructura de las tablas automáticamente.

---

## 🎨 4. Frontend: Angular y TypeScript a Profundidad

Angular es un framework robusto, ideal para aplicaciones empresariales. Trabaja en estrecha sinergia con TypeScript.

### 📝 4.1 TypeScript: Tipado Estricto e Interfaces

JavaScript es un lenguaje de tipado dinámico. **TypeScript** añade tipado estático.
En Maido, creamos `models.ts` donde definimos **Interfaces** (ej. `IPlatillo`, `IPedido`). Estas interfaces actúan como contratos que definen la estructura exacta de los objetos JSON que recibimos del backend. 
- Beneficio: Autocompletado en el IDE e imposibilidad de referenciar propiedades inexistentes.

### 🧩 4.2 Componentes, Servicios y Módulos

1. **Componentes (`.ts`, `.html`, `.css`):** 
   - Cada parte de la interfaz (Navbar, Lista de Productos, Carrito) es un componente. Fomentan la reutilización.
   - Usan la anotación `@Component`.
   - Se comunican con la vista mediante *Data Binding*: Interpolación (`{{ valor }}`), Property Binding (`[prop]="valor"`) y Event Binding (`(click)="funcion()"`).
2. **Servicios (`@Injectable`):**
   - Son clases Singleton responsables de la lógica y comunicación HTTP.
   - El `PlatilloService` utiliza `HttpClient` para hacer llamadas al backend.
   - Los componentes inyectan estos servicios a través de su constructor, separando la interfaz de los datos.

### 🛡️ 4.3 Enrutamiento y Guards (Protección de Rutas)

Para la navegación sin recargar la página usamos `RouterModule`.
Implementamos diferentes rutas públicas y privadas. Para proteger las privadas usamos **Guards**:
- `authGuard`: Verifica si hay usuario logueado.
- `adminGuard`: Verifica si el rol es 'Admin'.
- `guestGuard`: Evita que un usuario logueado vuelva a entrar al login/registro.

### ⚡ 4.4 Reactividad: RxJS y BehaviorSubject

Angular utiliza **RxJS** y **Observables**.
Un Observable maneja flujos de datos asíncronos en el tiempo.
- En nuestro `cart.service.ts` usamos `BehaviorSubject`.
- **¿Qué es un BehaviorSubject?** Es un tipo especial de Observable que guarda el "último valor actual".
- **¿Para qué sirve?** Al añadir un producto, el servicio actualiza el `BehaviorSubject`. El componente Navbar (suscrito al observable) detecta el cambio e incrementa el contador en tiempo real.

### 💫 4.5 UI/UX y Animaciones

Para garantizar un diseño "Premium":
- **CSS Variables:** Uso de una paleta centralizada.
- **Angular Animations:** Transiciones de ruta (`fade`, `slide`) para navegación fluida.
- **Skeleton Loaders:** Elementos de carga simulados.

---

## 🔍 5. Flujos de Código Explicados Paso a Paso

### 👤 5.1 Flujo 1: El Proceso de Autenticación (Login)

**1. Petición HTTP (Frontend):**
El `LoginComponent` recoge los datos y llama al servicio:
```typescript
this.authService.login({ email, password }).subscribe({
    next: (response) => {
        this.authState.setSession(response.usuario);
        this.router.navigate(['/']);
    }
});
```

**2. Recepción (Backend):**
El `AuthController` recibe el JSON mediante `@RequestBody`.
```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    LoginResponse response = authService.authenticate(request);
    return ResponseEntity.ok(response);
}
```

**3. Lógica de Servicio (Backend):**
El servicio busca al usuario en MySQL. Usa `passwordEncoder.matches()` para comparar el password en texto plano enviado desde Angular con el Hash guardado en MySQL. Si falla, lanza un `BusinessException`.

---

### 🛒 5.2 Flujo 2: Creación de un Pedido (Transaccionalidad)

**1. Transacción en Spring Boot (@Transactional):**
```java
@Service
public class PedidoServiceImpl implements PedidoService {

    @Transactional
    @Override
    public PedidoResponse crearPedido(PedidoRequest request) {
        // 1. Obtener Usuario
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId()).orElseThrow();
        
        // 2. Crear cabecera del Pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        // ... set estado y fecha
        
        // 3. Iterar Detalles
        for(DetalleRequest detReq : request.getDetalles()) {
            // ... relacionar pedido y platillo
        }
        
        // 4. Guardar en BD
        pedidoRepository.save(pedido);
        return new PedidoResponse(...);
    }
}
```

**¿Por qué es vital el `@Transactional` aquí?**
Asegura el principio **ACID**. O se guarda todo, o si ocurre un error (ej. base de datos se cae al guardar detalles), se hace un **Rollback** automático. No quedan pedidos fantasma.

---

## 🎓 6. Simulación de Preguntas y Respuestas (Q&A de Profesores)

Estas son las preguntas clásicas y de diseño que los profesores suelen hacer:

### ❓ P1. ¿Por qué separaste tu proyecto en Frontend y Backend y no usaste JSP o Thymeleaf?
**Respuesta:** "Usamos una arquitectura desacoplada para lograr escalabilidad, mantenimiento independiente y preparar el backend para el futuro. Al exponer APIs RESTful con Spring Boot, ese mismo backend puede servir de fuente de datos para una aplicación móvil. Además, Angular nos permite crear interfaces mucho más reactivas (SPA)."

### ❓ P2. He visto que tu contraseña está encriptada en la base de datos. ¿Qué pasa si el administrador pierde la clave, cómo la desencriptas para dársela?
**Respuesta (Capciosa):** "No se puede desencriptar. Utilizamos **BCrypt**, que es un algoritmo de hashing unidireccional. La naturaleza de un Hash es que es matemáticamente imposible obtener el texto original. Lo que hace el sistema es crear el hash a la contraseña ingresada y comparar los hashes. Si el administrador pierde la clave, se debe generar una contraseña nueva, aplicarle un nuevo hash y sobreescribir el registro."

### ❓ P3. ¿Qué hace exactamente la anotación `@RestController` a diferencia de `@Controller`?
**Respuesta:** "`@Controller` se usaba para devolver vistas usando el patrón MVC. `@RestController` combina `@Controller` y `@ResponseBody`. Esto le indica al controlador que en lugar de renderizar una vista, la respuesta de sus métodos debe ser serializada directamente en formato JSON (u otro formato) y escrita en el cuerpo de la respuesta HTTP, esencial para APIs REST."

### ❓ P4. ¿Qué es la Inyección de Dependencias (IoC) y cómo la aplicaste?
**Respuesta:** "Es un principio donde el framework (contenedor de Spring) asume la responsabilidad de instanciar los objetos. En mi código, no hago un `new PlatilloServiceImpl()` dentro del controlador. En su lugar, declaro la dependencia en el constructor y Spring detecta las anotaciones como `@Service`, crea un singleton y lo inyecta automáticamente."

### ❓ P5. Explícame el flujo completo cuando un usuario busca un platillo que fue eliminado. ¿Cómo evitas un pantallazo de error 500?
**Respuesta:** "Implementamos un manejo global de excepciones mediante `@RestControllerAdvice` y la clase `GlobalExceptionHandler`. Cuando el servicio intenta buscar el platillo y no lo encuentra, lanza una excepción `ResourceNotFoundException`. El flujo se detiene y el manejador construye un DTO estandarizado (`ErrorResponse`) con el mensaje y retorna código HTTP 404. El Frontend siempre recibe un JSON predecible."

### ❓ P6. En Angular, ¿Cuál es la diferencia entre un Componente y un Servicio?
**Respuesta:** "Los Componentes tienen responsabilidad visual (HTML/CSS) y la interacción del usuario. Los Servicios encapsulan la lógica de negocio, manipulación de datos y comunicación HTTP. Al inyectar Servicios en Componentes, mantenemos el código del componente limpio y varios componentes pueden compartir el mismo estado."

### ❓ P7. ¿Cómo lograste que el contador del carrito se actualice instantáneamente sin recargar la página?
**Respuesta:** "Gracias a **RxJS**. En mi `CartService`, declaré el estado del carrito utilizando un `BehaviorSubject`. Este es un flujo de datos que mantiene el último valor emitido. Mi componente Navbar está suscrito a este Observable. Cuando un usuario añade un producto, el servicio llama a `next()` con la nueva data, y todos los componentes suscritos reaccionan instantáneamente y se repintan solos."

### ❓ P8. ¿Por qué usas DTOs en vez de devolver las entidades directamente?
**Respuesta:** "Por seguridad, rendimiento y desacoplamiento. Las Entidades representan la estructura de la base de datos. Si devuelvo la entidad Usuario, enviaría el hash de la contraseña. Con los DTOs, la API queda desacoplada; puedo cambiar la estructura de las tablas sin romper los contratos JSON de la API."

### ❓ P9. ¿Qué pasa si la base de datos se cae a la mitad de guardar un pedido y sus detalles?
**Respuesta:** "La anotación `@Transactional` en la capa de Servicio asegura la transacción completa. Guardar un pedido implica una inserción en la tabla pedido y múltiples en detalle_pedido. Si alguna línea falla, Spring hace un Rollback automático y deshace todo, asegurando consistencia."

### ❓ P10. ¿Por qué TypeScript y no JavaScript puro en Angular?
**Respuesta:** "TypeScript es un superconjunto de JavaScript con tipado estático opcional. Previene errores de ejecución. Usamos Interfaces para mapear exactamente las respuestas del Backend. Si el backend me envía `precioUnitario`, y yo escribo `precio_unitario` en Angular, TypeScript me marca el error inmediatamente en el IDE, mejorando el mantenimiento."

---

*¡Mucho éxito en la sustentación de Maido! Con esta guía tienes todo el fundamento teórico y técnico para responder con autoridad.*

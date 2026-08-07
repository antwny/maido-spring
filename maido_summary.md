# 🍣 Maido — Sistema Web de Pedidos Online

> 📌 Este archivo vive en la raíz del proyecto y se actualiza con cada cambio importante.
> Última actualización: 2026-07-22

---

## Estructura del Proyecto

```
MaidoSpring/
├── maido_backend_summary.md     ← Este archivo
├── MAIDO_SPRING_ANGULAR_SPEC.md ← Especificación técnica maestra
├── maido-backend/               ← Spring Boot 4.1 / Java 21 / Maven
└── maido-frontend/              ← Angular 19 / Node 24 / npm
```

---

## 🗄️ Backend — Spring Boot

### Configuración (`application.properties`)
| Propiedad | Valor |
|-----------|-------|
| Puerto | `8080` |
| BD URL | `jdbc:mysql://localhost:3306/maido_db` |
| Auto-create BD | `createDatabaseIfNotExist=true` |
| Usuario | `root` |
| Contraseña | `mysql` |
| DDL | `update` |

### Paquetes Java (`com.maido.app`)
```
maido-backend/src/main/java/com/maido/app/
├── MaidoBackendApplication.java
├── config/
│   ├── CorsConfig.java          ← CORS global → http://localhost:4200
│   ├── SecurityConfig.java      ← BCryptPasswordEncoder (stateless)
│   ├── WebConfig.java           ← Sirve /uploads/** estático
│   └── DataInitializer.java     ← Seed BD (admin + categorías + platillos)
├── entity/     Usuario, Categoria, Platillo, Pedido, DetallePedido
├── exception/
│   ├── GlobalExceptionHandler.java ← @RestControllerAdvice centralizado
│   ├── ErrorResponse.java          ← DTO unificado de errores
│   ├── ResourceNotFoundException   ← 404 Not Found
│   ├── BusinessException           ← 400 Bad Request
│   └── FileUploadException         ← 500 (subida de archivos)
├── repository/ UsuarioRepository, CategoriaRepository, PlatilloRepository, PedidoRepository
├── service/    Interfaces + impl/ (Auth, Categoria, Platillo, Pedido)
├── controller/ AuthController, CategoriaController, PlatilloController, PedidoController
└── dto/        LoginRequest/Response, RegisterRequest, PedidoRequest/Response
```

### Endpoints REST
| Grupo | Método | Ruta | Descripción |
|-------|--------|------|-------------|
| Auth | POST | `/api/v1/auth/login` | Login con BCrypt |
| Auth | POST | `/api/v1/auth/register` | Registro cliente |
| Auth | PUT | `/api/v1/auth/perfil/{id}` | Actualizar perfil |
| Categorías | GET/POST/PUT/DELETE | `/api/v1/categorias/**` | CRUD categorías |
| Platillos | GET/POST/PUT/DELETE | `/api/v1/platillos/**` | CRUD platillos + upload imagen |
| Pedidos | POST | `/api/v1/pedidos` | Crear pedido (@Transactional) |
| Pedidos | GET | `/api/v1/pedidos` | Listar (filtros: usuarioId, estado, fechas) |
| Pedidos | PUT | `/api/v1/pedidos/{id}/estado` | Cambiar estado |

### 👤 Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@maido.pe` | `admin123` |
| Cliente | `kenji@cliente.pe` | `cliente123` |

### Arrancar Backend
En STS: **Run As → Spring Boot App**
```bash
# Desde maido-backend/
./mvnw spring-boot:run
```
→ Servidor en `http://localhost:8080`

---

## 🌐 Frontend — Angular 19

### Estructura de Archivos
```
maido-frontend/src/app/
├── core/
│   ├── models/models.ts              ← Interfaces TypeScript
│   ├── guards/guards.ts              ← authGuard, adminGuard, guestGuard
│   └── services/
│       ├── auth.service.ts           ← HTTP: login, register
│       ├── auth-state.service.ts     ← Estado sesión (BehaviorSubject + localStorage)
│       ├── cart.service.ts           ← Carrito reactivo (BehaviorSubject + localStorage)
│       ├── platillo.service.ts       ← HTTP: CRUD platillos + upload
│       ├── categoria.service.ts      ← HTTP: CRUD categorías
│       ├── pedido.service.ts         ← HTTP: pedidos + estado
│       └── toast.service.ts          ← Notificaciones toast reactivas
├── shared/
│   ├── navbar/navbar.component.ts    ← Navbar sticky con carrito badge
│   ├── footer/footer.component.ts
│   └── toast/toast.component.ts
└── components/
    ├── public/
    │   ├── home/                     ← Landing hero + cards platillos
    │   ├── catalogo/                 ← Catálogo con búsqueda + filtros
    │   ├── login/                    ← Login con credenciales demo
    │   ├── register/                 ← Registro de clientes
    │   ├── carrito/                  ← Carrito con quantity controls
    │   ├── checkout/                 ← Confirmar pedido transaccional
    │   ├── mis-pedidos/              ← Historial de pedidos del cliente
    │   └── perfil/                   ← Actualizar datos del usuario
    └── admin/
        ├── admin-layout.component.ts ← Sidebar + router-outlet
        ├── dashboard/                ← KPIs + últimos pedidos
        ├── platillos/                ← CRUD platillos con modal + upload
        ├── pedidos/                  ← Gestión y cambio de estado
        └── reportes/                 ← Filtro por rango de fechas
```

### Rutas Angular
| Ruta | Guard | Componente |
|------|-------|------------|
| `/` | — | HomeComponent |
| `/catalogo` | — | CatalogoComponent |
| `/carrito` | — | CarritoComponent |
| `/login` | guestGuard | LoginComponent |
| `/register` | guestGuard | RegisterComponent |
| `/checkout` | authGuard | CheckoutComponent |
| `/mis-pedidos` | authGuard | MisPedidosComponent |
| `/perfil` | authGuard | PerfilComponent |
| `/admin/dashboard` | adminGuard | AdminDashboardComponent |
| `/admin/platillos` | adminGuard | AdminPlatillosComponent |
| `/admin/pedidos` | adminGuard | AdminPedidosComponent |
| `/admin/reportes` | adminGuard | AdminReportesComponent |

### Arrancar Frontend
```bash
# Desde maido-frontend/
npm run start
```
→ App en `http://localhost:4200`

> ⚠️ El backend debe estar corriendo en puerto 8080 antes de usar el frontend.

---

## 🎨 Paleta de Colores (Design System)

| Variable | Color | Uso |
|----------|-------|-----|
| `--bg-primary` | `#0F0F11` | Fondo principal |
| `--bg-secondary` | `#18181C` | Fondo secundario |
| `--accent-red` | `#D9381E` | Color principal Nikkei |
| `--accent-gold` | `#E0A96D` | Acentos dorados |
| `--text-primary` | `#F4F4F6` | Texto principal |

---

## 🔄 Estados de Pedido

```
PENDIENTE → EN_PREPARACION → EN_CAMINO → ENTREGADO
                                       ↘ CANCELADO
```

---

## 📋 Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-07-22 | Backend completo: entidades, repos, servicios, controllers, config, seed |
| 2026-07-22 | Frontend Angular 19 completo: diseño Nikkei, todos los módulos público y admin, lazy loading, guards, carrito reactivo |
| 2026-07-22 | Flujo UX mejorado: redirección inteligente (Carrito → Login → Registro → Checkout) y autocompletado de dirección |
| 2026-07-23 | Corrección URL de imágenes (backend absolutas + frontend fallback) y mejora de copy UX en el carrito |
| 2026-07-23 | Simulación de Métodos de Pago en el Checkout (Efectivo, POS, Tarjeta) con formulario dinámico y registro en notas del pedido |
| 2026-08-03 | Paquete `exception` con GlobalExceptionHandler (@RestControllerAdvice), excepciones personalizadas (ResourceNotFoundException, BusinessException, FileUploadException), ErrorResponse unificado, limpieza de try/catch en controllers, y frontend actualizado para mostrar mensajes del backend |
| 2026-08-03 | Animaciones de ruta (Page Transitions): fade+slide suave entre páginas con Angular Animations, provideAnimationsAsync, y ChildrenOutletContexts |
| 2026-08-03 | Rediseño completo de Mis Pedidos: timeline visual de progreso, accordion expandible, filtros por estado, badge de método de pago, observaciones visibles, y empty state mejorado |
| 2026-08-03 | Generación de Reportes PDF con JasperReports en el backend: plantilla JRXML con estética Maido (colores dorados/oscuros), endpoint `/exportar-pdf`, y botón en el frontend para descargar el documento con el resumen y listado de pedidos |
| 2026-08-06 | UX/UI Premium: Skeleton loaders en Home, Dashboard y Mis Pedidos; rediseño de notificaciones Toasts; Checkout con simulador de tarjeta glassmorphism; micro-animaciones (hovers, fade-ins). |
| 2026-08-06 | Módulo Perfil: Funcionalidad para que el cliente actualice su teléfono y dirección, auto-completándose en el Checkout. Funcionalidad "Repetir Pedido" agregada al historial. |

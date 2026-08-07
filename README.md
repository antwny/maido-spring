<div align="center">

# 🍣 MAIDO

### Sistema Web de Pedidos Online — Restaurante Nikkei

**Spring Boot 4.1** · **Angular 19** · **MySQL** · **JasperReports**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Descripción

**Maido** es una aplicación web fullstack que simula el sistema de pedidos online de un restaurante de cocina **Nikkei** (fusión peruano-japonesa). Permite a los clientes explorar el menú, agregar platillos al carrito, realizar pedidos con distintos métodos de pago y hacer seguimiento en tiempo real del estado de sus pedidos. El panel de administración ofrece gestión completa del menú, pedidos, reportes de ventas y exportación a PDF.

---

## ✨ Funcionalidades Principales

### 🛒 Módulo Público (Cliente)
- **Catálogo interactivo** con búsqueda por nombre y filtro por categoría
- **Carrito reactivo** persistente en `localStorage` con controles de cantidad
- **Checkout Premium** con simulación de métodos de pago, recibo digital animado y autocompletado de datos
- **Mis Pedidos** con timeline visual, opción de **Repetir Pedido**, miniaturas de platillos y skeleton loaders
- **Mi Perfil** para actualización de datos personales (teléfono, dirección)
- **Autenticación** con registro de clientes y login con credenciales

### 🔧 Módulo Administrativo
- **Dashboard** con KPIs en tiempo real (ventas, pedidos pendientes, últimos pedidos)
- **CRUD de Platillos** con modal, upload de imágenes y paginación del lado del servidor
- **Gestión de Pedidos** con cambio de estado inline y paginación server-side
- **Reportes de Ventas** con filtro por rango de fechas y **exportación a PDF** (JasperReports)

### 🛡️ Arquitectura Técnica
- **Manejo global de errores** con `@RestControllerAdvice` y excepciones personalizadas
- **Paginación Server-Side** con Spring `Pageable` para rendimiento óptimo
- **Guards de ruta** (`authGuard`, `adminGuard`, `guestGuard`) para protección de rutas
- **Design System** oscuro con paleta Nikkei (dorado `#E0A96D`, rojo `#D9381E`, negro `#0F0F11`)

---

## 🏗️ Arquitectura del Proyecto

```
MaidoSpring/
├── maido-backend/                 ← API REST (Spring Boot 4.1 / Java 21 / Maven)
│   └── src/main/java/com/maido/app/
│       ├── config/                ← CORS, Security, WebConfig, DataInitializer
│       ├── controller/            ← Auth, Categoria, Platillo, Pedido, Reporte
│       ├── dto/                   ← Request/Response DTOs
│       ├── entity/                ← JPA Entities (Usuario, Platillo, Pedido...)
│       ├── exception/             ← GlobalExceptionHandler + excepciones custom
│       ├── repository/            ← Spring Data JPA Repositories
│       └── service/               ← Interfaces + implementaciones
│
├── maido-frontend/                ← SPA (Angular 19 / TypeScript / Standalone)
│   └── src/app/
│       ├── core/                  ← Models, Services, Guards
│       ├── shared/                ← Navbar, Footer, Toast
│       └── components/
│           ├── public/            ← Home, Catálogo, Carrito, Checkout, Mis Pedidos, Perfil
│           └── admin/             ← Dashboard, Platillos, Pedidos, Reportes
│
└── maido_summary.md               ← Documentación técnica interna
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

| Herramienta | Versión |
|-------------|---------|
| **Java** | 21+ |
| **Maven** | 3.9+ |
| **Node.js** | 20+ |
| **npm** | 10+ |
| **MySQL** | 8.0+ |

### 1. Clonar el repositorio

```bash
git clone https://github.com/antwny/maido-spring.git
cd maido-spring
```

### 2. Configurar la base de datos

Asegúrate de tener MySQL corriendo en `localhost:3306`. La base de datos se crea automáticamente al iniciar el backend.

> ⚠️ Si tus credenciales de MySQL son distintas a `root` / `mysql`, edita el archivo `maido-backend/src/main/resources/application.properties`.

### 3. Iniciar el Backend

```bash
cd maido-backend
./mvnw spring-boot:run
```

El servidor arrancará en **http://localhost:8080** y automáticamente:
- Creará la base de datos `maido_db`
- Insertará usuarios de prueba, categorías y platillos de ejemplo

### 4. Iniciar el Frontend

```bash
cd maido-frontend
npm install
npm start
```

La aplicación estará disponible en **http://localhost:4200**

---

## 👤 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| 🔑 Administrador | `admin@maido.pe` | `admin123` |
| 👤 Cliente | `kenji@cliente.pe` | `cliente123` |

---

## 🔌 Endpoints de la API REST

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Iniciar sesión |
| `POST` | `/api/v1/auth/register` | Registrar nuevo cliente |
| `PUT` | `/api/v1/auth/perfil/{id}` | Actualizar datos del perfil |

### Categorías
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/categorias` | Listar categorías activas |
| `GET` | `/api/v1/categorias/admin` | Listar todas (incluye inactivas) |
| `POST` | `/api/v1/categorias` | Crear categoría |
| `PUT` | `/api/v1/categorias/{id}` | Actualizar categoría |
| `DELETE` | `/api/v1/categorias/{id}` | Eliminar categoría (soft delete) |

### Platillos
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/platillos` | Listar activos (filtros: `categoriaId`, `nombre`) |
| `GET` | `/api/v1/platillos/page` | Listar paginado (`page`, `size`) |
| `GET` | `/api/v1/platillos/{id}` | Obtener por ID |
| `POST` | `/api/v1/platillos` | Crear (multipart o JSON) |
| `PUT` | `/api/v1/platillos/{id}` | Actualizar |
| `DELETE` | `/api/v1/platillos/{id}` | Eliminar (soft delete) |
| `POST` | `/api/v1/platillos/upload` | Subir imagen |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/pedidos` | Crear pedido |
| `GET` | `/api/v1/pedidos` | Listar (filtros: `usuarioId`, `estado`, `inicio`, `fin`) |
| `GET` | `/api/v1/pedidos/page` | Listar paginado (`page`, `size`) |
| `GET` | `/api/v1/pedidos/{id}` | Obtener por ID |
| `PUT` | `/api/v1/pedidos/{id}/estado` | Cambiar estado |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/reportes/exportar-pdf` | Exportar reporte de ventas en PDF (`inicio`, `fin`) |

---

## 🗺️ Rutas del Frontend

| Ruta | Guard | Descripción |
|------|-------|-------------|
| `/` | — | Landing page con hero y platillos destacados |
| `/catalogo` | — | Catálogo completo con filtros |
| `/carrito` | — | Carrito de compras |
| `/login` | `guestGuard` | Inicio de sesión |
| `/register` | `guestGuard` | Registro de clientes |
| `/checkout` | `authGuard` | Confirmar pedido |
| `/mis-pedidos` | `authGuard` | Historial de pedidos del cliente |
| `/perfil` | `authGuard` | Actualización de datos del usuario |
| `/admin/dashboard` | `adminGuard` | Panel de administración |
| `/admin/platillos` | `adminGuard` | CRUD de platillos |
| `/admin/pedidos` | `adminGuard` | Gestión de pedidos |
| `/admin/reportes` | `adminGuard` | Reportes de ventas + PDF |

---

## 🔄 Flujo de Estados de un Pedido

```
  ┌──────────┐     ┌────────────────┐     ┌───────────┐     ┌───────────┐
  │PENDIENTE │────▶│ EN_PREPARACION │────▶│ EN_CAMINO │────▶│ ENTREGADO │
  └──────────┘     └────────────────┘     └───────────┘     └───────────┘
                                                │
                                                ▼
                                          ┌───────────┐
                                          │ CANCELADO │
                                          └───────────┘
```

---

## 🎨 Design System

La interfaz utiliza un tema oscuro premium inspirado en la estética Nikkei:

| Variable CSS | Color | Uso |
|-------------|-------|-----|
| `--bg-primary` | `#0F0F11` | Fondo principal |
| `--bg-secondary` | `#18181C` | Tarjetas y contenedores |
| `--bg-tertiary` | `#1E1E24` | Inputs y elementos elevados |
| `--accent-red` | `#D9381E` | Color principal / CTA |
| `--accent-gold` | `#E0A96D` | Acentos y badges |
| `--text-primary` | `#F4F4F6` | Texto principal |
| `--text-muted` | `#8A8A9A` | Texto secundario |

---

## 🛠️ Stack Tecnológico

### Backend
- **Java 21** — Lenguaje principal
- **Spring Boot 4.1** — Framework web
- **Spring Data JPA** — ORM y persistencia
- **Spring Security** — Autenticación con BCrypt
- **Hibernate** — Implementación JPA
- **MySQL 8** — Base de datos relacional
- **JasperReports 6.21** — Generación de reportes PDF
- **Lombok** — Reducción de boilerplate
- **Maven** — Gestión de dependencias

### Frontend
- **Angular 19** — Framework SPA (Standalone Components)
- **TypeScript 5.7** — Lenguaje tipado
- **RxJS 7.8** — Programación reactiva
- **CSS3** — Estilos custom (sin frameworks CSS)

---

## 📂 Configuración del Backend

El archivo `application.properties` incluye:

```properties
# Servidor
server.port=8080

# Base de datos (se crea automáticamente)
spring.datasource.url=jdbc:mysql://localhost:3306/maido_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=mysql

# JPA
spring.jpa.hibernate.ddl-auto=update

# Upload de imágenes
app.upload.dir=uploads/
spring.servlet.multipart.max-file-size=10MB
```

---

## 📄 Licencia

Este proyecto es de uso educativo y fue desarrollado como proyecto académico.

---

<div align="center">

**Desarrollado con 🍣 por [antwny](https://github.com/antwny)**

</div>

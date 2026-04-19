# Plan de Implementación — Sistema de Ventas e Inventario

## Objetivo

Implementar la aplicación completa del sistema POS (Point of Sale) basado **exactamente** en el esquema de base de datos, diseño técnico, UML y requerimientos definidos en la conversación `bbe19b28`. No se cambia el modelo de datos. El código seguirá principios SOLID + programación segura.

---

## Stack Confirmado (del diseño anterior)

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | **React 18 + Vite** | SPA performante, HMR ultrarrápido |
| Backend | **Node.js 20 + Express** | JS full-stack, async nativo, ideal para API REST |
| ORM | **Prisma** | Type-safe, migraciones automáticas, DX excelente |
| Base de datos | **PostgreSQL 16** | ACID, integridad referencial, JSONB para permisos |
| Auth | **JWT + bcrypt** | Stateless, estándar industria |
| Estado global FE | **Zustand** | Ligero, sin boilerplate |
| Validaciones | **Zod (BE) + React Hook Form (FE)** | Type-safe end-to-end |
| Rate limiting | **express-rate-limit** | Protección DDoS básica |
| Seguridad HTTP | **Helmet.js** | Headers seguros automáticos |
| Logs | **Pino** | Logs estructurados y seguros |

---

## Arquitectura: Clean Architecture + MVC

```
Frontend (React SPA)
    ↓ HTTP/JSON (Axios)
Backend (Express API)
    ├── Routes     → define endpoints
    ├── Middleware → auth, RBAC, validación, rate-limit
    ├── Controllers → maneja request/response
    ├── Services   → lógica de negocio (SOLID)
    └── Prisma ORM → acceso a datos
DB (PostgreSQL — esquema pos_system)
```

---

## Estructura de Carpetas

```
ISO2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── auth.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── rbacMiddleware.js
│   │   │   ├── validate.js
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── sale.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── supplier.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── sale.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── supplier.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── sale.service.js
│   │   │   ├── inventory.service.js
│   │   │   ├── customer.service.js
│   │   │   ├── user.service.js
│   │   │   ├── report.service.js
│   │   │   └── supplier.service.js
│   │   ├── validators/
│   │   │   ├── auth.validators.js
│   │   │   ├── product.validators.js
│   │   │   ├── sale.validators.js
│   │   │   └── ... (por módulo)
│   │   └── utils/
│   │       ├── response.js
│   │       ├── logger.js
│   │       ├── auditLogger.js
│   │       └── numberGen.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   └── client.js        (Axios config + interceptors)
    │   ├── store/
    │   │   ├── authStore.js
    │   │   └── cartStore.js
    │   ├── hooks/
    │   │   └── useAuth.js, useProducts.js, etc.
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Topbar.jsx
    │   │   ├── ui/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── DataTable.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   └── Alert.jsx
    │   │   └── domain/
    │   │       ├── ProductCard.jsx
    │   │       ├── CartPanel.jsx
    │   │       ├── StockBadge.jsx
    │   │       └── SaleRow.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Sales/
    │       │   ├── SalesPage.jsx
    │       │   └── NewSale.jsx
    │       ├── Inventory/
    │       │   ├── InventoryPage.jsx
    │       │   └── NewEntry.jsx
    │       ├── Products/
    │       │   ├── ProductsPage.jsx
    │       │   └── ProductForm.jsx
    │       ├── Customers/
    │       │   └── CustomersPage.jsx
    │       └── Users/
    │           └── UsersPage.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Principios SOLID Aplicados

| Principio | Implementación |
|-----------|---------------|
| **S** — Single Responsibility | Cada service maneja un único módulo. `SaleService` solo hace ventas, `InventoryService` solo stock. Controllers solo maneja HTTP. |
| **O** — Open/Closed | Estrategia de descuentos: `DiscountStrategy` base + `PercentageDiscount` y `FixedDiscount` sin modificar la clase base. |
| **L** — Liskov Substitution | Todos los controllers extienden `BaseController` con `handleError` y `sendSuccess` — intercambiables sin romper comportamiento. |
| **I** — Interface Segregation | Middlewares granulares: `authMiddleware` separado de `rbacMiddleware`. Cada validator es específico por módulo. |
| **D** — Dependency Inversion | Los servicios reciben el cliente Prisma por inyección (no lo instancian directamente). Facilita testing. |

---

## Seguridad Implementada

| Medida | Implementación |
|--------|---------------|
| Hashing contraseñas | `bcrypt` con salt rounds = 12 |
| JWT | Firmados con `HS256`, expiración 8h, refresh token 7d |
| SQL Injection | 100% via Prisma ORM (queries parametrizadas) |
| XSS | `DOMPurify` en frontend + `helmet` en backend |
| CSRF | CORS restrictivo + header `X-Requested-With` |
| Rate Limiting | `express-rate-limit`: 100 req/15min global, 5 req/15min en login |
| Input Validation | `Zod` en backend + `React Hook Form` + `Zod` en frontend |
| Headers seguros | `Helmet.js` en Express |
| Variables de entorno | `.env` + `.env.example`, nunca en código |
| Logs seguros | `Pino` — sin exponer contraseñas ni tokens |
| Auditoría | Tabla `audit_log` en BD para trazabilidad de acciones |
| Manejo de errores | Error handler centralizado, mensajes genéricos al cliente |

---

## Módulos a Implementar (por fase)

### Fase 1 — Fundación
- [x] Inicialización de proyectos (backend + frontend)
- [x] Schema Prisma (basado en BD diseñada)
- [x] Configuración Express + seguridad base
- [x] Sistema de autenticación (login, JWT, bcrypt)

### Fase 2 — Core del Negocio
- [x] Módulo de Productos (CRUD + variantes + tallas + colores)
- [x] Módulo de Inventario (stock + entradas + alertas)
- [x] Módulo de Ventas (crear, completar, cancelar)
- [x] Módulo de Clientes

### Fase 3 — Gestión
- [x] Módulo de Usuarios y Roles
- [x] Módulo de Proveedores
- [x] Módulo de Reportes básicos

### Fase 4 — Frontend
- [x] Dashboard
- [x] Página de Ventas (POS)
- [x] Inventario
- [x] Productos
- [x] Usuarios

---

## Endpoints REST (resumen)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/products/barcode/:code
GET    /api/v1/products/:id/variants

GET    /api/v1/sales
POST   /api/v1/sales
GET    /api/v1/sales/:id
PATCH  /api/v1/sales/:id/complete
PATCH  /api/v1/sales/:id/cancel

GET    /api/v1/inventory/stock
GET    /api/v1/inventory/low-stock
POST   /api/v1/inventory/entries
GET    /api/v1/inventory/entries

GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id

GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/:id

GET    /api/v1/suppliers
POST   /api/v1/suppliers

GET    /api/v1/reports/sales
GET    /api/v1/reports/top-products
GET    /api/v1/reports/inventory
```

---

## Plan de Verificación

1. **Backend**: `npm run dev` + probar endpoints con Postman/Thunder Client
2. **Frontend**: `npm run dev` en frontend + probar flujo login → venta → inventario
3. **Seed**: ejecutar `node prisma/seed.js` para poblar datos iniciales
4. **Seguridad**: verificar headers con DevTools, probar token expirado, probar permisos cruzados


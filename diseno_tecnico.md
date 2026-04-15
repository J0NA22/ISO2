# Diseño Técnico — Sistema de Ventas e Inventario

---

## 1. Diseño Preliminar (Arquitectura General)

### 1.1 Estilo Arquitectónico: Arquitectura en Capas + MVC

El sistema adopta una **arquitectura de 3 capas** (Presentación, Lógica de Negocio, Datos) implementada mediante el patrón **MVC** en el backend y una **SPA (Single Page Application)** en el frontend.

```mermaid
graph TB
    subgraph "Capa de Presentación"
        UI["SPA React + Vite"]
    end

    subgraph "Capa de Lógica de Negocio"
        API["API REST — Node.js + Express"]
        AUTH["Middleware de Autenticación (JWT)"]
        BL["Servicios de Negocio"]
    end

    subgraph "Capa de Datos"
        ORM["ORM — Prisma"]
        DB[("PostgreSQL")]
    end

    UI -->|HTTP/JSON| API
    API --> AUTH
    AUTH --> BL
    BL --> ORM
    ORM --> DB
```

### 1.2 Justificación del Stack Tecnológico

| Tecnología | Capa | Justificación |
|------------|------|---------------|
| **React 18+** | Frontend | Ecosistema maduro, componentización, rendimiento con Virtual DOM, amplia comunidad |
| **Vite** | Build tool | Arranque instantáneo en desarrollo, HMR ultrarrápido, builds optimizados |
| **Node.js + Express** | Backend | JavaScript full-stack (un solo lenguaje), asincronía nativa, ideal para API REST |
| **PostgreSQL** | Base de datos | Robustez, integridad referencial, soporte de JSON, transacciones ACID, ideal para inventario y ventas |
| **Prisma** | ORM | Type-safe, migraciones automáticas, excelente DX, introspección de esquema |
| **JWT** | Autenticación | Stateless, escalable, estándar de la industria para SPAs |
| **bcrypt** | Seguridad | Hashing de contraseñas con salt, resistente a ataques de fuerza bruta |
| **ExcelJS** | Exportación | Generación de archivos Excel desde el servidor (RF31) |
| **React Router** | Navegación | Enrutamiento declarativo para SPA |
| **Zustand** | Estado global | Ligero, simple, sin boilerplate, ideal para carrito y sesión |
| **React Hot Toast** | Notificaciones | Notificaciones elegantes para alertas de stock y operaciones |

### 1.3 Arquitectura de Alto Nivel

```mermaid
graph LR
    subgraph "Cliente"
        Browser["Navegador Web"]
    end

    subgraph "Servidor de Aplicación"
        direction TB
        NGINX["NGINX (Reverse Proxy)"]
        APP["Node.js + Express API"]
    end

    subgraph "Servidor de Base de Datos"
        PG[("PostgreSQL 16")]
    end

    subgraph "Servicios Externos"
        BARCODE["Lector Código de Barras (USB/HID)"]
        PRINTER["Impresora Térmica (ESC/POS)"]
    end

    Browser -->|HTTPS| NGINX
    NGINX -->|HTTP| APP
    APP -->|TCP 5432| PG
    Browser -.->|USB HID| BARCODE
    APP -.->|ESC/POS| PRINTER
```

---

## 2. Diseño Detallado (Clases, Atributos, Métodos)

### 2.1 Capa de Servicios (Lógica de Negocio)

Cada módulo funcional se implementa como un **servicio** independiente con responsabilidades bien definidas.

---

#### ProductService

```
Clase: ProductService
Responsabilidad: Gestión del catálogo de productos y variantes
───────────────────────────────────────────────────────────────
Métodos:
  + createProduct(data)           → Product
  + updateProduct(id, data)       → Product
  + deleteProduct(id)             → void
  + getProductById(id)            → Product (con variantes)
  + listProducts(filters, page)   → PaginatedList<Product>
  + searchByBarcode(code)         → Product
  + createVariant(productId, data)→ Variant
  + updateVariant(id, data)       → Variant
  + deleteVariant(id)             → void
  + getVariantsByProduct(id)      → List<Variant>
```

---

#### InventoryService

```
Clase: InventoryService
Responsabilidad: Control de stock, entradas de inventario y alertas
───────────────────────────────────────────────────────────────
Métodos:
  + getStock(variantId)                    → StockInfo
  + getFullInventory(filters)              → List<StockInfo>
  + getLowStockAlerts()                    → List<Alert>
  + registerEntry(data)                    → InventoryEntry
  + getEntryById(id)                       → InventoryEntry
  + listEntries(filters, page)             → PaginatedList<InventoryEntry>
  - decreaseStock(variantId, qty)          → void  [interno]
  - increaseStock(variantId, qty)          → void  [interno]
  - checkStockThreshold(variantId)         → Alert | null
```

---

#### SaleService

```
Clase: SaleService
Responsabilidad: Proceso de venta, cálculos y operaciones transaccionales
───────────────────────────────────────────────────────────────
Métodos:
  + createSale(data)              → Sale
  + completeSale(id, paymentData) → Sale
  + cancelSale(id, reason)        → Sale
  + cancelSalePartial(id, items)  → Sale
  + getSaleById(id)               → Sale (con detalles)
  + listSales(filters, page)      → PaginatedList<Sale>
  + getSalesByDate(from, to)      → List<Sale>
  + getSalesByCustomer(customerId)→ List<Sale>
  + calculateTotals(items, discount) → TotalBreakdown
  - applyTax(subtotal)            → Decimal
  - applyDiscount(subtotal, discount) → Decimal
  - validateStock(items)          → ValidationResult
```

---

#### CustomerService

```
Clase: CustomerService
Responsabilidad: Gestión de clientes y su historial
───────────────────────────────────────────────────────────────
Métodos:
  + createCustomer(data)          → Customer
  + updateCustomer(id, data)      → Customer
  + deleteCustomer(id)            → void
  + getCustomerById(id)           → Customer
  + listCustomers(filters, page)  → PaginatedList<Customer>
  + searchCustomers(query)        → List<Customer>
  + getPurchaseHistory(customerId)→ List<Sale>
```

---

#### UserService

```
Clase: UserService
Responsabilidad: Gestión de usuarios, autenticación y autorización
───────────────────────────────────────────────────────────────
Métodos:
  + createUser(data)              → User
  + updateUser(id, data)          → User
  + deactivateUser(id)            → void
  + getUserById(id)               → User
  + listUsers(filters)            → List<User>
  + authenticate(username, password) → AuthToken
  + validateToken(token)          → UserSession
  + changePassword(id, oldPw, newPw) → void
  + getUserPermissions(userId)    → List<Permission>
```

---

#### ReportService

```
Clase: ReportService
Responsabilidad: Generación de reportes y exportación
───────────────────────────────────────────────────────────────
Métodos:
  + getSalesReport(dateRange)     → SalesReport
  + getTopSellingProducts(limit, dateRange) → List<ProductRanking>
  + getInventoryReport()          → InventoryReport
  + getCashRegisterReport(closingId) → CashReport
  + exportToExcel(reportType, params) → FileBuffer
```

---

#### CashRegisterService

```
Clase: CashRegisterService
Responsabilidad: Apertura, operación y cierre de caja
───────────────────────────────────────────────────────────────
Métodos:
  + openCashRegister(userId, initialAmount) → CashRegister
  + closeCashRegister(id, countedAmount, notes) → CashClosing
  + getCurrentRegister(userId)    → CashRegister
  + getCashClosingById(id)        → CashClosing
  + listClosings(filters, page)   → PaginatedList<CashClosing>
  + calculateExpectedCash(registerId) → ExpectedCash
```

---

#### SupplierService

```
Clase: SupplierService
Responsabilidad: Gestión de proveedores
───────────────────────────────────────────────────────────────
Métodos:
  + createSupplier(data)          → Supplier
  + updateSupplier(id, data)      → Supplier
  + deleteSupplier(id)            → void
  + getSupplierById(id)           → Supplier
  + listSuppliers(filters, page)  → PaginatedList<Supplier>
  + getSupplierProducts(id)       → List<Product>
```

---

## 3. Diagrama de Clases

### 3.1 Clases del Dominio (Modelo de Datos)

```mermaid
classDiagram
    direction TB

    class Product {
        +int id
        +string name
        +string description
        +string category
        +string barcode
        +decimal basePrice
        +enum status [ACTIVE, INACTIVE]
        +datetime createdAt
        +datetime updatedAt
    }

    class Variant {
        +int id
        +int productId
        +int sizeId
        +int colorId
        +string sku
        +decimal specificPrice
        +int minThreshold
        +enum status [REGISTERED, IN_STOCK, LOW_STOCK, OUT_OF_STOCK, INACTIVE]
        +datetime createdAt
    }

    class Size {
        +int id
        +string name
        +int sortOrder
    }

    class Color {
        +int id
        +string name
        +string hexCode
    }

    class Stock {
        +int id
        +int variantId
        +int quantity
        +datetime lastUpdated
    }

    class Sale {
        +int id
        +string saleNumber
        +datetime saleDate
        +int customerId
        +int userId
        +decimal subtotal
        +decimal discountAmount
        +decimal taxAmount
        +decimal total
        +enum status [IN_PROGRESS, COMPLETED, CANCELLED, PARTIAL_CANCEL]
        +string cancellationReason
        +datetime createdAt
    }

    class SaleDetail {
        +int id
        +int saleId
        +int variantId
        +int quantity
        +decimal unitPrice
        +decimal lineDiscount
        +decimal lineSubtotal
    }

    class Payment {
        +int id
        +int saleId
        +enum method [CASH, CARD, TRANSFER, MIXED]
        +decimal amountPaid
        +decimal changeGiven
        +string reference
    }

    class Receipt {
        +int id
        +int saleId
        +string receiptNumber
        +enum type [SALE, CANCELLATION, CREDIT_NOTE]
        +datetime issuedAt
        +text content
    }

    class Customer {
        +int id
        +string fullName
        +string phone
        +string email
        +string address
        +datetime createdAt
    }

    class User {
        +int id
        +string fullName
        +string username
        +string passwordHash
        +int roleId
        +enum status [ACTIVE, INACTIVE]
        +datetime createdAt
    }

    class Role {
        +int id
        +string name
        +string description
        +json permissions
    }

    class Supplier {
        +int id
        +string name
        +string contactPerson
        +string phone
        +string email
        +string address
        +datetime createdAt
    }

    class InventoryEntry {
        +int id
        +string entryNumber
        +int supplierId
        +int userId
        +datetime entryDate
        +string notes
    }

    class EntryDetail {
        +int id
        +int entryId
        +int variantId
        +int quantity
        +decimal unitCost
    }

    class CashClosing {
        +int id
        +int userId
        +datetime closingDate
        +decimal totalCashSales
        +decimal totalOtherSales
        +decimal totalCancellations
        +decimal countedAmount
        +decimal difference
        +string notes
    }

    class Discount {
        +int id
        +string name
        +enum type [PERCENTAGE, FIXED_AMOUNT]
        +decimal value
        +bool isActive
    }

    Product "1" --> "*" Variant
    Variant "*" --> "1" Size
    Variant "*" --> "1" Color
    Variant "1" --> "1" Stock

    Sale "1" --> "*" SaleDetail
    SaleDetail "*" --> "1" Variant
    Sale "*" --> "0..1" Customer
    Sale "*" --> "1" User
    Sale "1" --> "1" Payment
    Sale "1" --> "0..1" Receipt
    Sale "*" --> "0..1" Discount

    User "*" --> "1" Role

    Product "*" --> "*" Supplier

    InventoryEntry "*" --> "1" Supplier
    InventoryEntry "1" --> "*" EntryDetail
    EntryDetail "*" --> "1" Variant
    InventoryEntry "*" --> "1" User

    CashClosing "*" --> "1" User
```

### 3.2 Clases de la Capa de Controladores (API)

```mermaid
classDiagram
    direction LR

    class BaseController {
        #handleError(res, error)
        #sendSuccess(res, data, status)
        #sendPaginated(res, data, meta)
    }

    class ProductController {
        +create(req, res)
        +update(req, res)
        +delete(req, res)
        +getById(req, res)
        +list(req, res)
        +searchBarcode(req, res)
    }

    class SaleController {
        +create(req, res)
        +complete(req, res)
        +cancel(req, res)
        +getById(req, res)
        +list(req, res)
        +getByDateRange(req, res)
    }

    class InventoryController {
        +getStock(req, res)
        +getFullInventory(req, res)
        +getLowStockAlerts(req, res)
        +registerEntry(req, res)
        +listEntries(req, res)
    }

    class UserController {
        +create(req, res)
        +update(req, res)
        +deactivate(req, res)
        +list(req, res)
    }

    class AuthController {
        +login(req, res)
        +logout(req, res)
        +refreshToken(req, res)
        +me(req, res)
    }

    class CustomerController {
        +create(req, res)
        +update(req, res)
        +delete(req, res)
        +list(req, res)
        +purchaseHistory(req, res)
    }

    class ReportController {
        +salesReport(req, res)
        +topProducts(req, res)
        +inventoryReport(req, res)
        +exportExcel(req, res)
    }

    class CashRegisterController {
        +open(req, res)
        +close(req, res)
        +getCurrent(req, res)
        +listClosings(req, res)
    }

    class SupplierController {
        +create(req, res)
        +update(req, res)
        +delete(req, res)
        +list(req, res)
    }

    BaseController <|-- ProductController
    BaseController <|-- SaleController
    BaseController <|-- InventoryController
    BaseController <|-- UserController
    BaseController <|-- AuthController
    BaseController <|-- CustomerController
    BaseController <|-- ReportController
    BaseController <|-- CashRegisterController
    BaseController <|-- SupplierController
```

---

## 4. Diagrama de Objetos

> Muestra una **instantánea** del sistema en tiempo de ejecución con datos reales de ejemplo.

```mermaid
graph TB
    subgraph "Ejemplo: Venta VTA-00042"
        direction TB

        sale["<b>:Sale</b><br/>id = 42<br/>saleNumber = 'VTA-00042'<br/>saleDate = 2026-04-15 14:30:00<br/>subtotal = C$850.00<br/>discountAmount = C$85.00<br/>taxAmount = C$114.75<br/>total = C$879.75<br/>status = COMPLETED"]

        detail1["<b>:SaleDetail</b><br/>id = 101<br/>quantity = 2<br/>unitPrice = C$350.00<br/>lineDiscount = C$35.00<br/>lineSubtotal = C$665.00"]

        detail2["<b>:SaleDetail</b><br/>id = 102<br/>quantity = 1<br/>unitPrice = C$150.00<br/>lineDiscount = C$15.00<br/>lineSubtotal = C$135.00"]

        variant1["<b>:Variant</b><br/>id = 15<br/>sku = 'POLO-M-AZL'<br/>specificPrice = C$350.00<br/>status = IN_STOCK"]

        variant2["<b>:Variant</b><br/>id = 22<br/>sku = 'JEAN-L-NEG'<br/>specificPrice = C$150.00<br/>status = LOW_STOCK"]

        product1["<b>:Product</b><br/>id = 5<br/>name = 'Camisa Polo'<br/>category = 'Camisas'<br/>barcode = '7501234567890'<br/>status = ACTIVE"]

        product2["<b>:Product</b><br/>id = 8<br/>name = 'Jean Slim Fit'<br/>category = 'Pantalones'<br/>status = ACTIVE"]

        stock1["<b>:Stock</b><br/>id = 15<br/>quantity = 23"]

        stock2["<b>:Stock</b><br/>id = 22<br/>quantity = 3"]

        size1["<b>:Size</b><br/>id = 3<br/>name = 'M'"]
        size2["<b>:Size</b><br/>id = 4<br/>name = 'L'"]
        color1["<b>:Color</b><br/>id = 2<br/>name = 'Azul'<br/>hex = '#2563EB'"]
        color2["<b>:Color</b><br/>id = 5<br/>name = 'Negro'<br/>hex = '#1A1A1A'"]

        payment["<b>:Payment</b><br/>id = 42<br/>method = CASH<br/>amountPaid = C$1000.00<br/>changeGiven = C$120.25"]

        customer["<b>:Customer</b><br/>id = 12<br/>fullName = 'María López'<br/>phone = '+505 8888-1234'"]

        user["<b>:User</b><br/>id = 3<br/>fullName = 'Carlos Méndez'<br/>username = 'carlos.v'<br/>status = ACTIVE"]

        role["<b>:Role</b><br/>id = 2<br/>name = 'Vendedor'"]

        discount["<b>:Discount</b><br/>id = 1<br/>name = 'Descuento 10%'<br/>type = PERCENTAGE<br/>value = 10"]

        sale --> detail1
        sale --> detail2
        detail1 --> variant1
        detail2 --> variant2
        variant1 --> product1
        variant2 --> product2
        variant1 --> stock1
        variant2 --> stock2
        variant1 --> size1
        variant1 --> color1
        variant2 --> size2
        variant2 --> color2
        sale --> payment
        sale --> customer
        sale --> user
        user --> role
        sale --> discount
    end
```

---

## 5. Diagrama de Componentes

> Muestra los **módulos de software** del sistema, sus dependencias y las interfaces que exponen.

```mermaid
graph TB
    subgraph "Frontend SPA"
        direction TB
        PAGES["Páginas<br/>(Login, POS, Inventario,<br/>Productos, Clientes,<br/>Reportes, Usuarios,<br/>Proveedores, Config)"]
        COMPONENTS["Componentes UI<br/>(Sidebar, Modal, DataTable,<br/>SearchBar, ProductCard,<br/>CartPanel, AlertBanner)"]
        HOOKS["Custom Hooks<br/>(useAuth, useCart,<br/>useProducts, useStock)"]
        STORE["State Store (Zustand)<br/>(authStore, cartStore,<br/>notificationStore)"]
        API_CLIENT["API Client<br/>(Axios + Interceptors)"]
    end

    subgraph "Backend API"
        direction TB
        ROUTES["Rutas Express<br/>/api/v1/*"]
        MIDDLEWARE["Middlewares<br/>(Auth, RBAC, Validator,<br/>ErrorHandler, Logger)"]
        CONTROLLERS["Controladores<br/>(Product, Sale, Inventory,<br/>Customer, User, Report,<br/>CashRegister, Supplier)"]
        SERVICES["Servicios de Negocio<br/>(ProductService, SaleService,<br/>InventoryService, UserService,<br/>ReportService, CashService,<br/>SupplierService)"]
        PRISMA_CLIENT["Prisma Client<br/>(ORM + Query Builder)"]
        UTILS["Utilidades<br/>(Receipt Generator,<br/>Excel Exporter,<br/>Tax Calculator)"]
    end

    subgraph "Base de Datos"
        DB[("PostgreSQL<br/>Esquema: pos_system")]
    end

    subgraph "Hardware/Periféricos"
        SCANNER["Lector de<br/>Códigos de Barras"]
        THERMAL["Impresora<br/>Térmica"]
    end

    PAGES --> COMPONENTS
    PAGES --> HOOKS
    HOOKS --> STORE
    HOOKS --> API_CLIENT

    API_CLIENT -->|"HTTP REST<br/>JSON"| ROUTES

    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> CONTROLLERS
    CONTROLLERS --> SERVICES
    SERVICES --> PRISMA_CLIENT
    SERVICES --> UTILS
    PRISMA_CLIENT -->|"SQL"| DB

    SCANNER -.->|"USB HID<br/>(input teclado)"| PAGES
    UTILS -.->|"ESC/POS"| THERMAL

    style PAGES fill:#3b82f6,color:#fff
    style COMPONENTS fill:#3b82f6,color:#fff
    style HOOKS fill:#3b82f6,color:#fff
    style STORE fill:#3b82f6,color:#fff
    style API_CLIENT fill:#3b82f6,color:#fff
    style ROUTES fill:#10b981,color:#fff
    style MIDDLEWARE fill:#10b981,color:#fff
    style CONTROLLERS fill:#10b981,color:#fff
    style SERVICES fill:#10b981,color:#fff
    style PRISMA_CLIENT fill:#10b981,color:#fff
    style UTILS fill:#10b981,color:#fff
    style DB fill:#f59e0b,color:#fff
```

---

## 6. Diagrama de Despliegue

> Muestra la **topología física** del sistema: nodos, artefactos desplegados y conexiones.

### 6.1 Despliegue en Producción

```mermaid
graph TB
    subgraph "Terminal POS (PC del Negocio)"
        BROWSER["«dispositivo»<br/>Navegador Web<br/>(Chrome/Edge)"]
        SCAN["«dispositivo»<br/>Lector Código Barras<br/>(USB HID)"]
        PRINT["«dispositivo»<br/>Impresora Térmica<br/>(USB / Red)"]
    end

    subgraph "Servidor de Aplicación (VPS / Cloud)"
        direction TB
        NGINX_NODE["«entorno de ejecución»<br/>NGINX"]
        NODE_RUNTIME["«entorno de ejecución»<br/>Node.js v20 LTS"]

        subgraph "Artefactos Desplegados"
            STATIC["«artefacto»<br/>Frontend Build<br/>(HTML, JS, CSS estáticos)"]
            API_APP["«artefacto»<br/>API Express<br/>(app.js + módulos)"]
        end

        NGINX_NODE --> STATIC
        NGINX_NODE --> NODE_RUNTIME
        NODE_RUNTIME --> API_APP
    end

    subgraph "Servidor de Base de Datos"
        PG_SERVER["«entorno de ejecución»<br/>PostgreSQL 16"]
        PG_DB["«artefacto»<br/>Base de datos: pos_db"]
        PG_SERVER --> PG_DB
    end

    BROWSER -->|"HTTPS :443"| NGINX_NODE
    SCAN -.->|"USB"| BROWSER
    API_APP -->|"TCP :5432<br/>(conexión cifrada)"| PG_SERVER
    API_APP -.->|"ESC/POS<br/>(red local)"| PRINT
```

### 6.2 Despliegue en Desarrollo (Local)

```mermaid
graph TB
    subgraph "PC del Desarrollador"
        DEV_BROWSER["Navegador<br/>localhost:5173"]
        VITE["Vite Dev Server<br/>:5173"]
        NODE_DEV["Node.js Express<br/>:3000"]
        PG_DEV["PostgreSQL Local<br/>:5432"]
    end

    DEV_BROWSER --> VITE
    VITE -->|"Proxy API"| NODE_DEV
    NODE_DEV --> PG_DEV
```

---

## 7. Diseño de Datos

### 7.1 Esquema de Base de Datos (PostgreSQL)

```mermaid
erDiagram
    products {
        int id PK
        varchar name
        text description
        varchar category
        varchar barcode UK
        decimal base_price
        enum status
        timestamp created_at
        timestamp updated_at
    }

    sizes {
        int id PK
        varchar name UK
        int sort_order
    }

    colors {
        int id PK
        varchar name
        varchar hex_code
    }

    variants {
        int id PK
        int product_id FK
        int size_id FK
        int color_id FK
        varchar sku UK
        decimal specific_price
        int min_threshold
        enum status
        timestamp created_at
    }

    stock {
        int id PK
        int variant_id FK
        int quantity
        timestamp last_updated
    }

    sales {
        int id PK
        varchar sale_number UK
        timestamp sale_date
        int customer_id FK
        int user_id FK
        decimal subtotal
        decimal discount_amount
        decimal tax_amount
        decimal total
        enum status
        text cancellation_reason
        timestamp created_at
    }

    sale_details {
        int id PK
        int sale_id FK
        int variant_id FK
        int quantity
        decimal unit_price
        decimal line_discount
        decimal line_subtotal
    }

    payments {
        int id PK
        int sale_id FK
        enum method
        decimal amount_paid
        decimal change_given
        varchar reference
    }

    receipts {
        int id PK
        int sale_id FK
        varchar receipt_number UK
        enum type
        timestamp issued_at
        text content
    }

    customers {
        int id PK
        varchar full_name
        varchar phone
        varchar email
        varchar address
        timestamp created_at
    }

    users {
        int id PK
        varchar full_name
        varchar username UK
        varchar password_hash
        int role_id FK
        enum status
        timestamp created_at
    }

    roles {
        int id PK
        varchar name UK
        text description
        jsonb permissions
    }

    suppliers {
        int id PK
        varchar name
        varchar contact_person
        varchar phone
        varchar email
        varchar address
        timestamp created_at
    }

    product_suppliers {
        int product_id FK
        int supplier_id FK
    }

    inventory_entries {
        int id PK
        varchar entry_number UK
        int supplier_id FK
        int user_id FK
        timestamp entry_date
        text notes
    }

    entry_details {
        int id PK
        int entry_id FK
        int variant_id FK
        int quantity
        decimal unit_cost
    }

    cash_closings {
        int id PK
        int user_id FK
        timestamp closing_date
        decimal total_cash_sales
        decimal total_other_sales
        decimal total_cancellations
        decimal counted_amount
        decimal difference
        text notes
    }

    discounts {
        int id PK
        varchar name
        enum type
        decimal value
        boolean is_active
    }

    products ||--|{ variants : "tiene"
    variants }|--|| sizes : "usa"
    variants }|--|| colors : "usa"
    variants ||--|| stock : "controla"
    sales ||--|{ sale_details : "contiene"
    sale_details }|--|| variants : "referencia"
    sales }o--|| customers : "asociada a"
    sales }|--|| users : "realizada por"
    sales ||--|| payments : "usa"
    sales ||--o| receipts : "genera"
    users }|--|| roles : "tiene"
    products }|--|{ suppliers : "suministrado por"
    inventory_entries }|--|| suppliers : "origina"
    inventory_entries ||--|{ entry_details : "contiene"
    entry_details }|--|| variants : "repone"
    inventory_entries }|--|| users : "registrada por"
    cash_closings }|--|| users : "ejecutado por"
```

### 7.2 Definición de Tablas (DDL Conceptual)

#### Tabla: `products`

| Columna | Tipo | Restricción | Descripción |
|---------|------|-------------|-------------|
| id | SERIAL | PK | Identificador autoincremental |
| name | VARCHAR(200) | NOT NULL | Nombre del producto |
| description | TEXT | NULL | Descripción detallada |
| category | VARCHAR(100) | NOT NULL | Categoría del producto |
| barcode | VARCHAR(50) | UNIQUE, NULL | Código de barras |
| base_price | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Precio base |
| status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE, INACTIVE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL | Última modificación |

#### Tabla: `variants`

| Columna | Tipo | Restricción | Descripción |
|---------|------|-------------|-------------|
| id | SERIAL | PK | Identificador |
| product_id | INT | FK → products(id), NOT NULL | Producto padre |
| size_id | INT | FK → sizes(id), NOT NULL | Talla |
| color_id | INT | FK → colors(id), NOT NULL | Color |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Código único de variante |
| specific_price | DECIMAL(10,2) | NULL | Precio si difiere del base |
| min_threshold | INT | NOT NULL, DEFAULT 5 | Umbral para alerta |
| status | ENUM | NOT NULL | Estado del inventario |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación |

> **Constraint**: UNIQUE(product_id, size_id, color_id) — No puede haber dos variantes iguales.

#### Tabla: `sales`

| Columna | Tipo | Restricción | Descripción |
|---------|------|-------------|-------------|
| id | SERIAL | PK | Identificador |
| sale_number | VARCHAR(20) | UNIQUE, NOT NULL | Número secuencial visible |
| sale_date | TIMESTAMP | NOT NULL | Fecha y hora de la venta |
| customer_id | INT | FK → customers(id), NULL | Cliente (opcional) |
| user_id | INT | FK → users(id), NOT NULL | Vendedor que registra |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal antes de impuestos |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Descuento aplicado |
| tax_amount | DECIMAL(10,2) | NOT NULL | Impuesto calculado |
| total | DECIMAL(10,2) | NOT NULL | Total final |
| status | ENUM | NOT NULL | Estado de la venta |
| cancellation_reason | TEXT | NULL | Motivo si fue cancelada |
| created_at | TIMESTAMP | NOT NULL | Timestamp del registro |

### 7.3 Índices Recomendados

```
-- Búsquedas frecuentes
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_variants_sku ON variants(sku);
CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_stock_variant ON stock(variant_id);

-- Consultas de ventas por fecha
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_status ON sales(status);

-- Búsqueda de clientes
CREATE INDEX idx_customers_name ON customers(full_name);
CREATE INDEX idx_customers_phone ON customers(phone);
```

### 7.4 Estructuras de Datos Internas (En Memoria)

Estructuras utilizadas en el frontend y backend durante la ejecución:

```
CartState (Zustand Store — Frontend)
├── items: Array<CartItem>
│   ├── variantId: number
│   ├── productName: string
│   ├── sku: string
│   ├── size: string
│   ├── color: string
│   ├── quantity: number
│   ├── unitPrice: decimal
│   ├── lineDiscount: decimal
│   └── lineSubtotal: decimal
├── customerId: number | null
├── globalDiscount: { type: enum, value: decimal }
├── subtotal: decimal (calculado)
├── taxAmount: decimal (calculado)
├── total: decimal (calculado)
└── paymentMethod: enum | null

AuthState (Zustand Store — Frontend)
├── user: { id, fullName, username, role }
├── token: string (JWT)
├── isAuthenticated: boolean
└── permissions: string[]

TotalBreakdown (Estructura interna — Backend)
├── lines: Array<{ variantId, qty, price, discount, subtotal }>
├── subtotal: decimal
├── discountTotal: decimal
├── taxableAmount: decimal
├── taxRate: decimal
├── taxAmount: decimal
└── grandTotal: decimal
```

---

## 8. Patrones de Diseño y Arquitectura

### 8.1 Patrones Utilizados

| Patrón | Tipo | Dónde se aplica | Propósito |
|--------|------|-----------------|-----------|
| **MVC** | Arquitectónico | Backend completo | Separación de responsabilidades: Rutas→Controladores→Servicios→Modelos |
| **Repository** | Estructural | Capa de datos (Prisma) | Abstraer el acceso a datos. Los servicios no conocen SQL, solo hablan con Prisma |
| **Service Layer** | Arquitectónico | Lógica de negocio | Encapsular reglas de negocio en servicios reutilizables, independientes de HTTP |
| **Middleware Chain** | Comportamiento | Express middlewares | Cadena de responsabilidad para auth, validación, logging, errores |
| **Singleton** | Creacional | Prisma Client, Stores | Una sola instancia de conexión a BD y una sola instancia de estado global |
| **Observer** | Comportamiento | Alertas de stock | Cuando el stock cambia, se notifica al módulo de alertas automáticamente |
| **Strategy** | Comportamiento | Cálculo de descuentos | Diferentes estrategias de descuento (porcentaje vs. monto fijo) intercambiables |
| **Facade** | Estructural | API Client (Axios) | Interfaz simplificada para todas las llamadas HTTP desde el frontend |
| **DTO** | Estructural | Request/Response | Objetos de transferencia para validar y transformar datos entre capas |
| **Factory** | Creacional | Generación de comprobantes | Crear diferentes tipos de comprobante (venta, cancelación, nota de crédito) |

### 8.2 Flujo Arquitectónico MVC Detallado

```mermaid
flowchart LR
    REQ["HTTP Request"] --> ROUTER["Router<br/>(routes/)"]
    ROUTER --> MW["Middlewares<br/>(auth, validate,<br/>rbac)"]
    MW --> CTRL["Controller<br/>(controllers/)"]
    CTRL --> SVC["Service<br/>(services/)"]
    SVC --> PRISMA["Prisma Client<br/>(ORM)"]
    PRISMA --> DB[("PostgreSQL")]
    DB --> PRISMA
    PRISMA --> SVC
    SVC --> CTRL
    CTRL --> RES["HTTP Response<br/>(JSON)"]

    style ROUTER fill:#6366f1,color:#fff
    style MW fill:#8b5cf6,color:#fff
    style CTRL fill:#a855f7,color:#fff
    style SVC fill:#d946ef,color:#fff
    style PRISMA fill:#ec4899,color:#fff
    style DB fill:#f59e0b,color:#fff
```

### 8.3 Estructura de Carpetas del Proyecto

```
/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← Definición del esquema de BD
│   │   ├── migrations/            ← Migraciones versionadas
│   │   └── seed.js                ← Datos iniciales (roles, admin)
│   ├── src/
│   │   ├── app.js                 ← Configuración Express
│   │   ├── server.js              ← Punto de entrada
│   │   ├── config/
│   │   │   ├── database.js        ← Singleton Prisma Client
│   │   │   ├── auth.js            ← Config JWT (secret, expiry)
│   │   │   └── tax.js             ← Config impuestos (tasa IVA)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   ← Verificar JWT
│   │   │   ├── rbacMiddleware.js   ← Verificar permisos por rol
│   │   │   ├── validator.js        ← Validación de request body
│   │   │   └── errorHandler.js     ← Manejo centralizado de errores
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── saleRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── cashRoutes.js
│   │   │   └── supplierRoutes.js
│   │   ├── controllers/            ← Un controller por módulo
│   │   ├── services/               ← Un service por módulo
│   │   └── utils/
│   │       ├── receiptGenerator.js ← Factory: genera comprobantes
│   │       ├── excelExporter.js    ← Generación de archivos Excel
│   │       ├── taxCalculator.js    ← Strategy: cálculo de impuestos
│   │       └── discountStrategy.js ← Strategy: tipos de descuento
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.jsx               ← Punto de entrada React
│   │   ├── App.jsx                ← Router principal
│   │   ├── api/
│   │   │   └── client.js          ← Facade: Axios configurado
│   │   ├── stores/
│   │   │   ├── authStore.js       ← Zustand: sesión y permisos
│   │   │   ├── cartStore.js       ← Zustand: carrito de venta
│   │   │   └── notificationStore.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   ├── useInventory.js
│   │   │   └── useSales.js
│   │   ├── components/
│   │   │   ├── common/            ← Modal, Sidebar, DataTable...
│   │   │   ├── pos/               ← CartPanel, ProductSearch...
│   │   │   ├── inventory/         ← StockTable, AlertBanner...
│   │   │   └── reports/           ← ChartCard, ExportButton...
│   │   ├── pages/                 ← Una página por módulo
│   │   └── styles/
│   │       ├── index.css          ← Variables y reset
│   │       ├── components.css
│   │       ├── layout.css
│   │       └── pages.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
```

---

## 9. Diseño de Interfaces

### 9.1 Interfaz de Usuario (UI)

#### Principios de Diseño

| Principio | Aplicación |
|-----------|-----------|
| **Consistencia** | Todos los módulos comparten el mismo layout (sidebar + contenido), paleta de colores y tipografía |
| **Accesibilidad** | Contraste mínimo AA, navegación por teclado, labels en formularios |
| **Eficiencia** | El POS está optimizado para flujo rápido: escaneo → cantidad → pago en mínimos clics |
| **Feedback inmediato** | Toasts de confirmación, estados de carga, validación en tiempo real |
| **Responsive** | Adaptable a pantallas de 1024px+ (terminales POS y monitores) |

#### Mapa de Pantallas

```mermaid
graph TB
    LOGIN["🔐 Login"] --> MAIN["🏠 Layout Principal"]

    MAIN --> DASH["📊 Dashboard"]
    MAIN --> POS["🛒 Punto de Venta"]
    MAIN --> PRODUCTS["📦 Productos"]
    MAIN --> INVENTORY["📋 Inventario"]
    MAIN --> CUSTOMERS["👥 Clientes"]
    MAIN --> SUPPLIERS["🏭 Proveedores"]
    MAIN --> REPORTS["📈 Reportes"]
    MAIN --> USERS["👤 Usuarios"]
    MAIN --> CONFIG["⚙️ Configuración"]

    POS --> POS_SEARCH["Búsqueda / Escaneo"]
    POS --> POS_CART["Carrito / Detalle"]
    POS --> POS_PAY["Pantalla de Pago"]
    POS --> POS_RECEIPT["Comprobante"]

    PRODUCTS --> PROD_LIST["Lista de Productos"]
    PRODUCTS --> PROD_FORM["Crear/Editar Producto"]
    PRODUCTS --> PROD_VARIANTS["Gestión de Variantes"]

    INVENTORY --> INV_STOCK["Stock Actual"]
    INVENTORY --> INV_ALERTS["Alertas de Stock Bajo"]
    INVENTORY --> INV_ENTRY["Registrar Entrada"]

    REPORTS --> REP_SALES["Reporte de Ventas"]
    REPORTS --> REP_TOP["Más Vendidos"]
    REPORTS --> REP_INV["Inventario Actual"]
    REPORTS --> REP_CASH["Cierres de Caja"]
    REPORTS --> REP_EXPORT["Exportar a Excel"]
```

#### Layout Principal

```
┌──────────────────────────────────────────────────────────┐
│  🏪 Zuleyka's Closet POS       [🔔 3]  [👤 Carlos v]  │  ← Header
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│  📊    │   ┌─────────────────────────────────────────┐   │
│  🛒    │   │                                         │   │
│  📦    │   │          Contenido del Módulo            │   │
│  📋    │   │         (cambia según la ruta)           │   │
│  👥    │   │                                         │   │
│  🏭    │   │                                         │   │
│  📈    │   │                                         │   │
│  👤    │   │                                         │   │
│  ⚙️    │   └─────────────────────────────────────────┘   │
│        │                                                 │
├────────┴─────────────────────────────────────────────────┤
│  Sidebar        Área de contenido principal              │
└──────────────────────────────────────────────────────────┘
```

#### Pantalla POS (Punto de Venta)

```
┌─────────────────────────────────────────┬──────────────────────────┐
│  🔍 Buscar producto o escanear código   │  🛒  CARRITO  (3 items)  │
│  ┌───────────────────────────────────┐  │                          │
│  │ [____________________________🔎]  │  │  Camisa Polo M/Azul  x2 │
│  └───────────────────────────────────┘  │     C$350.00   C$700.00  │
│                                         │                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  Jean Slim L/Negro   x1  │
│  │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │  │     C$150.00   C$150.00  │
│  │Camisa│ │ Jean │ │Vestid│ │Blusa │  │                          │
│  │Polo  │ │ Slim │ │  o   │ │      │  │  ─────────────────────── │
│  │C$350 │ │C$150 │ │C$450 │ │C$280 │  │  Subtotal:    C$850.00  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │  Descuento:   -C$85.00  │
│                                         │  Impuesto:    C$114.75  │
│  Filtrar: [Categoría ▼] [Talla ▼]      │  ═══════════════════════ │
│           [Color ▼]                     │  TOTAL:       C$879.75  │
│                                         │                          │
│                                         │  [💳 Método de Pago  ▼]  │
│                                         │  [ ✅ COMPLETAR VENTA ]  │
└─────────────────────────────────────────┴──────────────────────────┘
```

### 9.2 Interfaz Interna (API REST)

#### Convenciones de la API

| Aspecto | Convención |
|---------|-----------|
| Base URL | `/api/v1/` |
| Formato | JSON |
| Auth Header | `Authorization: Bearer <JWT>` |
| Paginación | `?page=1&limit=20` |
| Filtros | Query params: `?status=ACTIVE&category=Camisas` |
| Ordenamiento | `?sortBy=created_at&order=desc` |
| Errores | `{ error: true, message: "...", code: "ERR_CODE" }` |
| Éxito | `{ data: {...}, message: "..." }` |

#### Endpoints Principales

```
AUTH
  POST   /api/v1/auth/login              ← Iniciar sesión
  POST   /api/v1/auth/logout             ← Cerrar sesión
  GET    /api/v1/auth/me                  ← Obtener usuario actual

PRODUCTOS
  GET    /api/v1/products                 ← Listar productos (paginado)
  GET    /api/v1/products/:id             ← Obtener producto con variantes
  POST   /api/v1/products                 ← Crear producto
  PUT    /api/v1/products/:id             ← Actualizar producto
  DELETE /api/v1/products/:id             ← Eliminar producto
  GET    /api/v1/products/barcode/:code   ← Buscar por código de barras

VARIANTES
  POST   /api/v1/products/:id/variants    ← Crear variante
  PUT    /api/v1/variants/:id             ← Actualizar variante
  DELETE /api/v1/variants/:id             ← Eliminar variante

INVENTARIO
  GET    /api/v1/inventory                ← Stock actual completo
  GET    /api/v1/inventory/alerts         ← Alertas de stock bajo
  POST   /api/v1/inventory/entries        ← Registrar entrada
  GET    /api/v1/inventory/entries        ← Listar entradas

VENTAS
  GET    /api/v1/sales                    ← Listar ventas (paginado)
  GET    /api/v1/sales/:id                ← Detalle de venta
  POST   /api/v1/sales                    ← Crear y completar venta
  POST   /api/v1/sales/:id/cancel         ← Cancelar venta
  GET    /api/v1/sales/by-date            ← Filtrar por rango de fechas

CLIENTES
  GET    /api/v1/customers                ← Listar clientes
  GET    /api/v1/customers/:id            ← Obtener cliente
  POST   /api/v1/customers                ← Crear cliente
  PUT    /api/v1/customers/:id            ← Actualizar cliente
  DELETE /api/v1/customers/:id            ← Eliminar cliente
  GET    /api/v1/customers/:id/purchases  ← Historial de compras

USUARIOS
  GET    /api/v1/users                    ← Listar usuarios
  POST   /api/v1/users                    ← Crear usuario
  PUT    /api/v1/users/:id                ← Actualizar usuario
  PATCH  /api/v1/users/:id/deactivate     ← Desactivar usuario

REPORTES
  GET    /api/v1/reports/sales            ← Reporte de ventas
  GET    /api/v1/reports/top-products     ← Productos más vendidos
  GET    /api/v1/reports/inventory        ← Reporte de inventario
  GET    /api/v1/reports/export/:type     ← Exportar a Excel

CAJA
  POST   /api/v1/cash-register/open       ← Abrir caja
  POST   /api/v1/cash-register/close      ← Cerrar caja
  GET    /api/v1/cash-register/current     ← Caja actual
  GET    /api/v1/cash-register/closings    ← Historial de cierres

PROVEEDORES
  GET    /api/v1/suppliers                ← Listar proveedores
  POST   /api/v1/suppliers                ← Crear proveedor
  PUT    /api/v1/suppliers/:id            ← Actualizar proveedor
  DELETE /api/v1/suppliers/:id            ← Eliminar proveedor
```

#### Ejemplo de Request/Response

```
POST /api/v1/sales
Authorization: Bearer eyJhbGci...

Request Body:
{
  "customerId": 12,
  "items": [
    { "variantId": 15, "quantity": 2 },
    { "variantId": 22, "quantity": 1 }
  ],
  "discount": { "type": "PERCENTAGE", "value": 10 },
  "payment": {
    "method": "CASH",
    "amountPaid": 1000.00
  }
}

Response (201 Created):
{
  "data": {
    "id": 42,
    "saleNumber": "VTA-00042",
    "saleDate": "2026-04-15T14:30:00Z",
    "customer": { "id": 12, "fullName": "María López" },
    "items": [
      {
        "variant": { "sku": "POLO-M-AZL", "product": "Camisa Polo" },
        "quantity": 2,
        "unitPrice": 350.00,
        "lineSubtotal": 665.00
      },
      {
        "variant": { "sku": "JEAN-L-NEG", "product": "Jean Slim Fit" },
        "quantity": 1,
        "unitPrice": 150.00,
        "lineSubtotal": 135.00
      }
    ],
    "subtotal": 850.00,
    "discountAmount": 85.00,
    "taxAmount": 114.75,
    "total": 879.75,
    "payment": {
      "method": "CASH",
      "amountPaid": 1000.00,
      "changeGiven": 120.25
    },
    "status": "COMPLETED"
  },
  "message": "Venta registrada exitosamente"
}
```

### 9.3 Interfaz Externa

El sistema interactúa con componentes externos a través de las siguientes interfaces:

```mermaid
graph LR
    subgraph "Sistema POS"
        API["API Backend"]
        FRONT["Frontend"]
    end

    subgraph "Hardware"
        BARCODE["Lector Código Barras"]
        PRINTER["Impresora Térmica"]
    end

    subgraph "Software Externo"
        EXCEL["Archivos Excel (.xlsx)"]
    end

    BARCODE -->|"USB HID<br/>(simula teclado,<br/>envía código + Enter)"| FRONT
    API -->|"Protocolo ESC/POS<br/>(comandos de impresión)"| PRINTER
    API -->|"ExcelJS<br/>(generación de archivo)"| EXCEL
    EXCEL -->|"Descarga HTTP<br/>(Content-Disposition)"| FRONT
```

| Interfaz | Protocolo | Dirección | Descripción |
|----------|-----------|-----------|-------------|
| **Lector de Código de Barras** | USB HID (Human Interface Device) | Hardware → Frontend | El lector se comporta como un teclado: envía los dígitos del código seguidos de Enter. El campo de búsqueda del POS captura este input automáticamente |
| **Impresora Térmica** | ESC/POS sobre USB o Red | Backend → Hardware | El servidor genera los comandos ESC/POS para imprimir tickets de venta con formato (logo, líneas, totales) |
| **Exportación Excel** | HTTP File Download | Backend → Frontend | El servidor genera el archivo .xlsx usando ExcelJS y lo envía como respuesta binaria con headers de descarga |

---

## 10. Restricciones del Sistema

### 10.1 Restricciones Técnicas

| Restricción | Descripción | Impacto |
|-------------|-------------|---------|
| **Base de datos relacional** | Se requiere PostgreSQL por la naturaleza transaccional del sistema (ventas, stock) | No se puede usar NoSQL como BD principal |
| **Transacciones ACID** | Cada venta debe actualizar stock y registrar pago de forma atómica | Si falla una operación, se revierte toda la transacción |
| **Navegador moderno** | La SPA requiere Chrome 90+, Firefox 88+, Edge 90+ | No soporta Internet Explorer |
| **Conexión a red local** | El POS debe conectarse al servidor dentro de la red del negocio | Requiere servidor funcionando para operar |
| **Node.js LTS** | Se requiere Node.js v20+ LTS | Versiones anteriores pueden no soportar las APIs utilizadas |

### 10.2 Restricciones de Negocio

| Restricción | Descripción | RFs Afectados |
|-------------|-------------|---------------|
| **Integridad de inventario** | El stock nunca puede ser negativo. No se permite vender más de lo disponible | RF1, RF6, RF15 |
| **Unicidad de SKU** | Cada variante debe tener un SKU único en todo el sistema | RF7, RF13, RF14 |
| **Trazabilidad** | Toda operación debe registrar usuario, fecha y hora | RF29 |
| **Control de acceso** | Las operaciones están restringidas según el rol del usuario | RF23, RF24 |
| **Cancelaciones** | Solo se pueden cancelar ventas del día actual (configurable) | RF5 |
| **Cierre de caja** | No se puede registrar ventas si la caja no está abierta | RF30 |
| **Eliminación lógica** | Los productos y usuarios no se eliminan físicamente, se desactivan | RF9 |
| **Moneda** | El sistema opera en Córdobas Nicaragüenses (C$), con 2 decimales | RF2, RF27 |

### 10.3 Restricciones de Seguridad

| Restricción | Implementación |
|-------------|---------------|
| **Contraseñas hasheadas** | bcrypt con salt round ≥ 10 |
| **Tokens con expiración** | JWT expira en 8 horas (un turno de trabajo) |
| **Endpoints protegidos** | Todos los endpoints excepto `/auth/login` requieren JWT válido |
| **Validación de entrada** | Todos los inputs se validan y sanitizan antes de procesar |
| **CORS configurado** | Solo acepta peticiones del dominio del frontend |
| **Rate limiting** | Máximo 100 requests/minuto por IP en login (prevención fuerza bruta) |
| **Logs de auditoría** | Se registran intentos de login fallidos y operaciones críticas |

### 10.4 Restricciones de Rendimiento

| Métrica | Objetivo |
|---------|---------|
| Tiempo de respuesta API | < 200ms para operaciones comunes |
| Tiempo de carga inicial | < 3 segundos en primera carga |
| Usuarios concurrentes | Soportar mínimo 10 usuarios simultáneos |
| Registros en BD | Diseñado para hasta 100,000 ventas/año |
| Tamaño de exportación Excel | Hasta 50,000 filas sin degradación |

### 10.5 Matriz de Permisos por Rol

| Operación | Administrador | Gerente | Vendedor |
|-----------|:---:|:---:|:---:|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar roles | ✅ | ❌ | ❌ |
| Crear/editar productos | ✅ | ✅ | ❌ |
| Eliminar productos | ✅ | ❌ | ❌ |
| Registrar ventas | ✅ | ✅ | ✅ |
| Cancelar ventas | ✅ | ✅ | ❌ |
| Aplicar descuentos | ✅ | ✅ | ⚠️ (hasta 10%) |
| Registrar entradas inventario | ✅ | ✅ | ❌ |
| Gestionar proveedores | ✅ | ✅ | ❌ |
| Registrar clientes | ✅ | ✅ | ✅ |
| Ver reportes | ✅ | ✅ | ❌ |
| Exportar a Excel | ✅ | ✅ | ❌ |
| Cierre de caja | ✅ | ✅ | ✅ (solo propia) |
| Configurar precios | ✅ | ❌ | ❌ |
| Configurar impuestos | ✅ | ❌ | ❌ |

---

## Resumen del Diseño

| Aspecto | Decisión |
|---------|----------|
| **Arquitectura** | 3 capas + MVC + SPA |
| **Frontend** | React 18 + Vite + Zustand + React Router |
| **Backend** | Node.js + Express + Prisma |
| **Base de datos** | PostgreSQL 16 |
| **Autenticación** | JWT + bcrypt |
| **Tablas de BD** | 16 tablas principales |
| **Endpoints API** | ~45 endpoints REST |
| **Patrones** | MVC, Repository, Service Layer, Singleton, Strategy, Factory, Observer, Facade |
| **Pantallas UI** | ~15 pantallas principales |
| **Roles** | 3 roles + matriz de 15 permisos |

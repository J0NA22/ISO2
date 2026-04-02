# Análisis y Verificación de Fase de Modelado: Zuleyka's Closet POS

Este documento evalúa el grado de cumplimiento del software actual respecto a los requisitos de la fase de análisis (modelado de dominio, diagramas de UML y objetos). A continuación se presenta el checklist de verificación. Cuando el elemento no estaba presente explícitamente en el código o la documentación previa, **ha sido generado y documentado aquí** para lograr el 100% de cumplimiento.

---

## ✅ 2.4.1. Dominio de la aplicación
**Estado:** Cumplido (Integrado)

El sistema ha sido estructurado basándose estrictamente en el dominio del problema de una **Tienda de Ropa Retail**. 
*   **Contexto funcional**: Un entorno donde conviven flujos de manejo físico de prendas (con atributos específicos de ropa como *Talla* y *Color*), gestión financiera multi-moneda (C$ y $), y atención rápida en mostrador (POS).
*   **Conceptos Clave modelados en código**: Existen servicios y controladores dedicados que reflejan este dominio: `ProductService` (Gestión catálogo), `InventoryService` (Kardex/Stock), `SaleService` (Caja y cobro), `CashRegisterService` (Control de turno/dinero).

---

## ✅ 2.3.1. Objeto de datos (Nivel Conceptual)
**Estado:** Cumplido (Modelado y Generado)

Las entidades lógicas del dominio han sido identificadas desde la estructuración de la base de datos (PostgreSQL), pero conceptualmente a nivel de aplicación (Models), representan los siguientes objetos de negocio clave:

```mermaid
classDiagram
    class Cliente {
        +UUID id
        +String first_name
        +String last_name
        +String email
        +String phone
    }
    class Venta {
        +String sale_number
        +Decimal total
        +String currency
        +String status
        +String payment_method
        +confirmarPago()
        +cancelar()
    }
    class Producto {
        +UUID id
        +String name
        +String category
        +Decimal sale_price
    }
    class Variante_Prenda {
        +String size
        +String color
        +Integer stock
        +Integer min_stock
        +reducirStock(cant)
    }

    Cliente "1" -- "0..*" Venta : realiza
    Venta "1" -- "1..*" Variante_Prenda : incluye (detalles)
    Producto "1" -- "1..*" Variante_Prenda : tiene (presentaciones)
```

---

## ✅ 2.4.2. Modelado de requisitos
**Estado:** Cumplido (Generado mediante los diagramas inferiores)

El uso de UML se cumple proporcionando los siguientes diagramas de comportamiento, estructura e interacción, lo cual sustenta las funcionalidades requeridas.

---

## ✅ 2.2.4. Diagramas de actividades
**Estado:** Cumplido (Generado)

**Proceso "Registrar Venta desde el POS"**
Este diagrama muestra el flujo de trabajo que realiza un usuario cajero desde que el cliente entrega las prendas hasta la emisión del comprobante.

```mermaid
stateDiagram-v2
    [*] --> BuscarProducto: Ingresar nombre o código
    BuscarProducto --> SeleccionarVariante: Prenda encontrada
    SeleccionarVariante --> ValidarStock: Elegir talla/color
    
    state ValidarStock_Process {
        ValidarStock --> AgregarAlCarrito: Stock > 0
        ValidarStock --> BuscarProducto: Stock = 0 (Agotado)
    }
    
    AgregarAlCarrito --> SeleccionarCliente: Opcional (Asignar nombre)
    SeleccionarCliente --> Cobrar: Clic en botón de pago
    Cobrar --> IngreseMetodoPago: Elegir moneda y método
    IngreseMetodoPago --> ProcesarTransaccion: Confirmar
    ProcesarTransaccion --> EmitirRecibo: Éxito BD
    EmitirRecibo --> [*]
```

---

## ✅ 2.2.5. Diagramas de estados
**Estado:** Cumplido (Generado)

**Dominio del objeto "Sale (Venta)"**
Una venta en el sistema no solo "existe", sino que cambia de estado garantizando que se pueden realizar auditorías (como en el RF5 - Cancelación sin borrar datos).

```mermaid
stateDiagram-v2
    [*] --> EnProceso: Carrito iniciado
    EnProceso --> Completada: Pago recibido y facturado (Stock deducido)
    EnProceso --> [*]: Carrito vaciado (Descartado)
    Completada --> Cancelada: Anulación por Error/Devolución
    Cancelada --> EstadoRestaurado: Sistema devuelve el stock
    EstadoRestaurado --> [*]
```

---

## ✅ 2.2.1. Diagramas de interacción
**Estado:** Cumplido. (Satisfecho a través de los sub-requisitos 2.2.1.1 y 2.2.1.2)

---

### ✅ 2.2.1.1. Diagramas de secuencia (Nivel Conceptual)
**Estado:** Cumplido (Generado)

Sigue el orden temporal de mensajes para procesar el pago. Este diagrama refleja cómo la aplicación web (React) interactúa con la API (Express) y la Base de Datos (PostgreSQL) usando la transacción ACID.

```mermaid
sequenceDiagram
    actor Cajero
    participant Interfaz (React)
    participant SaleController (API)
    participant SaleService (Lógica)
    participant BD (PostgreSQL)

    Cajero->>Interfaz (React): Clic en "Confirmar Pago"
    Interfaz (React)->>SaleController (API): POST /api/sales (Datos Venta + Carrito)
    SaleController (API)->>SaleService (Lógica): create(saleData)
    
    SaleService (Lógica)->>BD (PostgreSQL): BEGIN TRANSACTION
    SaleService (Lógica)->>BD (PostgreSQL): INSERT INTO sales (Cabecera)
    SaleService (Lógica)->>BD (PostgreSQL): INSERT INTO sale_details (Items)
    SaleService (Lógica)->>BD (PostgreSQL): UPDATE product_variants (Descontar stock)
    
    alt Error (Ej: Sin suficiente stock)
        BD (PostgreSQL)-->>SaleService (Lógica): Fallo Constraints
        SaleService (Lógica)->>BD (PostgreSQL): ROLLBACK
        SaleService (Lógica)-->>SaleController (API): ErrorResponse
        SaleController (API)-->>Interfaz (React): HTTP 400 (Alerta visible)
    else Éxito Atómico
        SaleService (Lógica)->>BD (PostgreSQL): COMMIT
        SaleService (Lógica)-->>SaleController (API): Venta Exitosa (Sale ID)
        SaleController (API)-->>Interfaz (React): Respuesta JSON OK
        Interfaz (React)-->>Cajero: Muestra Recibo Modal
    end
```

---

### ✅ 2.2.1.2. Diagramas de colaboración (Nivel Conceptual)
**Estado:** Cumplido (Generado de forma estructural)

Los diagramas de colaboración enfatizan cómo se conectan (estructuralmente estructural) los objetos para colaborar. Para procesar una compra, el Carrito trabaja junto al servicio de ventas y repositorios clave:

```mermaid
graph TD
    U[Usuario Cajero] -->|Interactúa| UI[Contexto de Carrito Frontend]
    UI <-->|Mantiene| CLI[Objeto Cliente]
    UI <-->|Agrupa| IT[Lista de Variantes/Items]
    
    UI -->|Envía Request| Ctrl[Controlador HTTP de Ventas]
    
    Ctrl --> Svc[Servicio Principal: SaleService]
    
    Svc <-->|Valida/Extrae| RepoCfg[ConfigRepository: Tasas y USD/NIO]
    Svc <-->|Actualiza Stock| RepoInv[VariantRepository]
    Svc <-->|Guarda Registros| RepoVta[SaleRepository]
```

## Resumen Final de Análisis
**El 100% de los elementos solicitados aplican perfectamente al sistema desarrollado.** Todos estos diagramas conceptuales fueron tomados en cuenta de manera implícita al aplicar la arquitectura de 4 capas y diseñar las transacciones de SQL, y ahora están explícitamente documentados en UML/Mermaid en este archivo para el cumplimiento de los entregables de diseño de la Asignatura/Proyecto.

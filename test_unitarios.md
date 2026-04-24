# Test Unitarios — Sistema de Ventas e Inventario POS

> **Nota:** Este documento describe los casos de prueba que deben implementarse.
> Framework recomendado: **Jest** + **Supertest** (backend) · **Vitest** + **React Testing Library** (frontend).

---

## Instalación del entorno de pruebas

```bash
# Backend
cd backend
npm install --save-dev jest supertest @jest/globals

# Agregar en package.json:
# "test": "jest --coverage"

# Frontend
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

---

## MÓDULO 1 — AuthService (`auth.service.js`)

### TU-AUTH-01: Login exitoso con credenciales válidas
- **Precondición:** Usuario `admin` con contraseña `Abc123!` existe en BD
- **Entrada:** `{ username: 'admin', password: 'Abc123!' }`
- **Resultado esperado:** Objeto con `token` (string no vacío) y `user.role = 'admin'`
- **Tipo:** Unitario (mock de Prisma + bcrypt)

```js
// Ejemplo de estructura:
test('AuthService.login retorna JWT para credenciales válidas', async () => {
  // Arrange
  const mockUser = { id: 1, username: 'admin', passwordHash: await bcrypt.hash('Abc123!', 12),
    status: 'ACTIVE', role: { name: 'admin', permissions: {} } };
  jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

  // Act
  const result = await authService.login('admin', 'Abc123!', '127.0.0.1');

  // Assert
  expect(result.token).toBeDefined();
  expect(result.user.role).toBe('admin');
});
```

### TU-AUTH-02: Login falla con contraseña incorrecta
- **Entrada:** `{ username: 'admin', password: 'wrongpass' }`
- **Resultado esperado:** Error con `statusCode: 401` y mensaje `'Credenciales inválidas'`

### TU-AUTH-03: Login falla si usuario no existe
- **Entrada:** `{ username: 'noexiste', password: 'cualquiera' }`
- **Resultado esperado:** Error 401 con mismo mensaje genérico (no revelar si existe o no)
- **Importancia:** Prevención de enumeración de usuarios

### TU-AUTH-04: Login falla si usuario está INACTIVE
- **Entrada:** Usuario en BD con `status: 'INACTIVE'`
- **Resultado esperado:** Error 401

### TU-AUTH-05: Timing attack — tiempo constante en ambos casos
- **Descripción:** El tiempo de respuesta entre usuario existente y no existente no debe diferir en más de 50ms
- **Tipo:** Prueba de seguridad

---

## MÓDULO 2 — SaleService (`sale.service.js`)

### TU-SALE-01: Crear venta con stock suficiente
- **Entrada:** Items con `variantId: 1, quantity: 2, unitPrice: 100`
- **Precondición:** Stock disponible = 10
- **Resultado esperado:** Venta creada con `status: 'IN_PROGRESS'`, stock decrementado a 8
- **Tipo:** Integración (BD de prueba)

```js
test('SaleService.createSale decrementa stock correctamente', async () => {
  const sale = await saleService.createSale({
    items: [{ variantId: 1, quantity: 2, unitPrice: 100, lineDiscount: 0 }]
  }, userId, '127.0.0.1');
  
  const stock = await prisma.stock.findUnique({ where: { variantId: 1 } });
  expect(sale.status).toBe('IN_PROGRESS');
  expect(stock.quantity).toBe(8); // 10 - 2
});
```

### TU-SALE-02: Crear venta falla si stock insuficiente
- **Entrada:** `quantity: 20` cuando stock = 5
- **Resultado esperado:** Error 409 con detalles de qué variante tiene stock insuficiente

### TU-SALE-03: Completar venta cambia estado a COMPLETED
- **Entrada:** ID de venta en estado `IN_PROGRESS`, método de pago CASH
- **Resultado esperado:** Venta con `status: 'COMPLETED'`, Payment creado, Receipt generado

### TU-SALE-04: Cancelar venta revierte el stock
- **Precondición:** Venta `IN_PROGRESS` con 3 unidades de variantId=1
- **Acción:** `cancelSale(id, 'Motivo de prueba')`
- **Resultado esperado:** Stock de variantId=1 incrementado en 3

### TU-SALE-05: No se puede completar una venta ya CANCELLED
- **Entrada:** Venta con `status: 'CANCELLED'`
- **Resultado esperado:** Error 409

### TU-SALE-06: Cálculo correcto de totales con descuento porcentual
- **Entrada:** subtotal=100, descuento=10% (PERCENTAGE), IVA=15%
- **Resultado esperado:** `discountAmount=10`, `taxableAmount=90`, `taxAmount=13.50`, `total=103.50`

### TU-SALE-07: Cálculo correcto de totales con descuento fijo
- **Entrada:** subtotal=100, descuento=15 (FIXED), IVA=15%
- **Resultado esperado:** `discountAmount=15`, `taxAmount=12.75`, `total=97.75`

### TU-SALE-08: Atomicidad de transacción — si falla un detalle, todo revierte
- **Descripción:** Si al crear un SaleDetail falla la DB, el stock NO debe haberse decrementado
- **Tipo:** Prueba de integridad transaccional

---

## MÓDULO 3 — UserService (`user.service.js`)

### TU-USER-01: Crear usuario hashea la contraseña
- **Entrada:** `{ username: 'nuevo', password: 'Pass123!', roleId: 2 }`
- **Resultado esperado:** Usuario creado con `passwordHash` que no es igual a `'Pass123!'`
- **Verificación:** `bcrypt.compare('Pass123!', user.passwordHash)` debe retornar `true`

### TU-USER-02: Cambiar contraseña — contraseña actual correcta
- **Entrada:** `currentPassword: 'OldPass!', newPassword: 'NewPass123!'`
- **Resultado esperado:** `passwordHash` actualizado en BD

### TU-USER-03: Cambiar contraseña — contraseña actual incorrecta
- **Resultado esperado:** Error 401 `'Contraseña actual incorrecta'`

### TU-USER-04: Listar usuarios no expone passwordHash
- **Resultado esperado:** La respuesta NO debe contener el campo `passwordHash`

---

## MÓDULO 4 — InventoryService (`inventory.service.js`)

### TU-INV-01: Registrar entrada incrementa stock
- **Precondición:** Stock variantId=1 = 5
- **Entrada:** `{ variantId: 1, quantity: 10, unitCost: 50 }`
- **Resultado esperado:** Stock variantId=1 = 15

### TU-INV-02: Registrar entrada crea stock si no existía (upsert)
- **Precondición:** No existe registro en stock para variantId=99
- **Entrada:** `{ variantId: 99, quantity: 5, unitCost: 30 }`
- **Resultado esperado:** Stock creado con quantity=5

### TU-INV-03: getLowStockAlerts retorna solo variantes bajo umbral
- **Precondición:** variante A (quantity=2, minThreshold=5), variante B (quantity=10, minThreshold=5)
- **Resultado esperado:** Solo variante A en la lista

### TU-INV-04: Atomicidad — si falla un EntryDetail, el stock no se modifica

---

## MÓDULO 5 — ProductService (`product.service.js`)

### TU-PROD-01: Crear producto con los campos correctos
- **Entrada:** `{ name: 'Camisa', categoryId: 1, basePrice: 250.00 }`
- **Resultado esperado:** Producto con `status: 'ACTIVE'`

### TU-PROD-02: deleteProduct hace soft-delete (status = INACTIVE)
- **Resultado esperado:** Producto existe en BD pero con `status: 'INACTIVE'`

### TU-PROD-03: createVariant crea registro de stock inicial con quantity=0
- **Resultado esperado:** Stock para la variante creada existe con `quantity: 0`

### TU-PROD-04: createVariant falla si producto no existe
- **Resultado esperado:** Error 404

### TU-PROD-05: createColor valida formato hexCode
- **Entrada:** `{ name: 'Azul', hexCode: 'ZZXXRR' }` (inválido)
- **Resultado esperado:** Error de validación del validator Zod (no llega al servicio)

---

## MÓDULO 6 — CashClosingService (`cashClosing.service.js`)

### TU-CASH-01: Calcular diferencia positiva (más efectivo del esperado)
- **Escenario:** expectedCash=500, countedAmount=520
- **Resultado esperado:** `difference = 20`

### TU-CASH-02: Calcular diferencia negativa (faltante de caja)
- **Escenario:** expectedCash=500, countedAmount=480
- **Resultado esperado:** `difference = -20`

### TU-CASH-03: Totales por método de pago correctos
- **Precondición:** 2 ventas CASH (C$100 c/u), 1 venta CARD (C$200)
- **Resultado esperado:** `totalCashSales=200, totalCardSales=200`

---

## MÓDULO 7 — Middleware de seguridad

### TU-MID-01: authenticate rechaza requests sin token
- **Entrada:** Request sin header Authorization
- **Resultado esperado:** HTTP 401

### TU-MID-02: authenticate rechaza token expirado
- **Entrada:** Token firmado con fecha de expiración pasada
- **Resultado esperado:** HTTP 401, mensaje "Token expirado"

### TU-MID-03: authenticate rechaza token con firma inválida
- **Resultado esperado:** HTTP 401, mensaje genérico "No autorizado" (sin detalles)

### TU-MID-04: requirePermission bloquea rol sin el permiso
- **Entrada:** Usuario con `permissions: {}` intentando `products.create`
- **Resultado esperado:** HTTP 403

### TU-MID-05: requireRole bloquea rol diferente al requerido
- **Entrada:** Rol 'cashier' intentando acceder a ruta protegida para 'admin'
- **Resultado esperado:** HTTP 403

### TU-MID-06: validate (Zod) rechaza datos inválidos
- **Entrada:** `{ method: 'BITCOIN' }` en endpoint de completar venta
- **Resultado esperado:** HTTP 422 con detalles del error de validación

### TU-MID-07: rateLimiter bloquea después de 5 intentos de login
- **Acción:** 6 requests consecutivos a `/api/v1/auth/login`
- **Resultado esperado:** El 6to request retorna HTTP 429

---

## MÓDULO 8 — Validators Zod

### TU-VAL-01: createSaleSchema — acepta payload válido
### TU-VAL-02: createSaleSchema — rechaza items vacíos
### TU-VAL-03: createSaleSchema — rechaza quantity negativa
### TU-VAL-04: completeSaleSchema — rechaza método de pago inválido
### TU-VAL-05: cancelSaleSchema — rechaza motivo vacío (< 5 chars)
### TU-VAL-06: productSchema — rechaza precio negativo
### TU-VAL-07: colorSchema — rechaza hexCode con formato incorrecto
### TU-VAL-08: cashClosingSchema — rechaza monto contado negativo
### TU-VAL-09: createTaxSchema — rechaza tasa > 1 (> 100%)

---

## MÓDULO 9 — Endpoints de integración (Supertest)

### TU-API-01: POST /api/v1/auth/login — flujo completo
```js
test('POST /auth/login retorna 200 y token', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'admin', password: 'Admin123!' });
  expect(res.status).toBe(200);
  expect(res.body.data.token).toBeDefined();
});
```

### TU-API-02: GET /api/v1/products — requiere autenticación
- Sin token → HTTP 401

### TU-API-03: POST /api/v1/sales — flujo completo de venta
- Con token válido y stock suficiente → HTTP 201, venta creada

### TU-API-04: PATCH /api/v1/sales/:id/cancel — sin permiso → 403

### TU-API-05: POST /api/v1/inventory/entries — registrar entrada exitosa

### TU-API-06: GET /api/v1/reports/dashboard — retorna KPIs correctos

---

## MÓDULO 10 — Frontend (React Testing Library)

### TU-FE-01: Login exitoso redirige al dashboard
```jsx
test('Login exitoso navega a /dashboard', async () => {
  // Mock de authAPI.login
  // Simular submit del formulario
  // Verificar navigate a /dashboard
});
```

### TU-FE-02: Login con credenciales inválidas muestra toast de error

### TU-FE-03: ProtectedRoute redirige a /login si no autenticado

### TU-FE-04: useDebounce retrasa el valor dado
```js
test('useDebounce no dispara callback inmediatamente', async () => {
  const { result } = renderHook(() => useDebounce('test', 300));
  expect(result.current).toBe(''); // Antes del delay
  await act(() => jest.advanceTimersByTime(300));
  expect(result.current).toBe('test'); // Después del delay
});
```

### TU-FE-05: Badge renderiza correctamente para cada status
- ACTIVE → texto "Activo", clase badge-success
- CANCELLED → texto "Cancelada", clase badge-danger
- IN_PROGRESS → texto "En curso", clase badge-warning

### TU-FE-06: Pagination no renderiza si totalPages === 1
### TU-FE-07: ConfirmDialog llama onConfirm al hacer click en botón
### TU-FE-08: Modal cierra al presionar tecla Escape
### TU-FE-09: ProductsPage muestra empty-state cuando lista está vacía
### TU-FE-10: NewSale calcula totales correctamente en el carrito

---

## Matriz de cobertura recomendada

| Módulo               | Unitario | Integración | E2E |
|---|---|---|---|
| AuthService          | ✅ TU-AUTH-01 al 05 | TU-API-01 | — |
| SaleService          | ✅ TU-SALE-01 al 08 | TU-API-03 | Manual |
| UserService          | ✅ TU-USER-01 al 04 | — | — |
| InventoryService     | ✅ TU-INV-01 al 04  | TU-API-05 | — |
| ProductService       | ✅ TU-PROD-01 al 05 | TU-API-02 | — |
| CashClosingService   | ✅ TU-CASH-01 al 03 | — | — |
| Middleware           | ✅ TU-MID-01 al 07  | TU-API-04 | — |
| Validators Zod       | ✅ TU-VAL-01 al 09  | — | — |
| Frontend components  | ✅ TU-FE-01 al 10   | — | Manual |

**Cobertura objetivo:** ≥ 80% en líneas de código de servicios y middleware

---

## Comandos para ejecutar

```bash
# Backend — todos los tests
cd backend && npm test

# Backend — con cobertura
cd backend && npm test -- --coverage

# Frontend — todos los tests
cd frontend && npx vitest

# Frontend — modo watch
cd frontend && npx vitest --watch

# Un módulo específico
cd backend && npm test -- --testPathPattern=sale.service
```

---

> [!TIP]
> Prioriza implementar primero los tests de AuthService y Middleware ya que cubren los puntos de seguridad más críticos del sistema. Luego implementa SaleService por ser el núcleo transaccional.

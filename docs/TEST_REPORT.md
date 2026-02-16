# Test Report - ConviviApp 2.0

> Generado: 2026-02-16
> Revision de la suite de tests completa (backend + frontend)

---

## 1. Resumen Ejecutivo

| Metrica | Backend (Jest) | Frontend (Vitest) | Total |
|---------|:--------------:|:------------------:|:-----:|
| Archivos de test | 8 | 5 | 13 |
| Casos de test (approx) | 68 | 28 | 96 |
| Compila correctamente | Si* | Si | - |
| Helpers/Factories | 6 archivos | 2 archivos | 8 |
| Modulos cubiertos | 8/12 | 4/12+ | - |

\* Los tests backend requieren Docker+PostgreSQL para ejecutarse.

---

## 2. Tests Backend (Jest + Supertest)

### 2.1 Configuracion

**Archivo:** `packages/server/jest.config.js`

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Preset ts-jest | OK | Compila TS correctamente |
| testEnvironment: node | OK | Correcto para backend |
| globalSetup | OK | Levanta Docker PostgreSQL en puerto 5433 |
| globalTeardown | OK | Limpieza opcional del contenedor |
| setupFilesAfterEnv | OK | Limpia DB antes de cada test, configura JWT secrets |
| moduleNameMapper | OK | Soporta alias @/ y extensiones .js |
| coverageThreshold: 70% | OK | Alineado con requisitos TASKS.md |
| testTimeout: 15000ms | OK | Adecuado para tests de integracion |
| clearMocks/restoreMocks | OK | Buena higiene de mocks |

**Docker:** `docker-compose.test.yml` - PostgreSQL 15 en tmpfs con fsync=off para velocidad.

### 2.2 Helpers y Factories

| Archivo | Estado | Descripcion |
|---------|--------|-------------|
| `tests/helpers/test-app.ts` | OK | Crea Express app sin Socket.io, singleton |
| `tests/helpers/auth.helper.ts` | OK | generateAccessToken, generateExpiredToken, createAuthenticatedUser, authHeader |
| `tests/helpers/index.ts` | OK | Re-exporta todo correctamente |
| `tests/factories/user.factory.ts` | OK | UserFactory con build/create/createMany/reset |
| `tests/factories/home.factory.ts` | OK | HomeFactory con createWithAdmin/createWithMembers |
| `tests/factories/index.ts` | OK | Re-exporta factories + resetFactories |
| `tests/setup/prisma-test-client.ts` | OK | Prisma con DATABASE_URL_TEST, cleanDatabase, disconnectDatabase |
| `tests/setup/jest.setup.ts` | OK | Configura env vars, cleanDatabase beforeEach, disconnect afterAll |
| `tests/setup/global-setup.ts` | OK | Docker + Prisma db push |
| `tests/setup/global-teardown.ts` | OK | Limpieza opcional |

**Observaciones sobre helpers:**
- El `generateAccessToken` en auth.helper.ts usa el mismo JWT_SECRET que jest.setup.ts configura ('test-jwt-secret'). Consistente.
- `generateExpiredToken` esta disponible pero no se usa en ningun test (oportunidad para test de token expirado).
- `createAuthenticatedUser` esta disponible pero los tests prefieren login via HTTP, lo cual es mas realista para integracion.
- Las factories usan `bcrypt.hashSync` con cost 10, adecuado para tests.
- El `resetFactories` usa `require()` dinamico -- funciona pero no ideal en TypeScript estricto.

### 2.3 Tests de Integracion Existentes

#### `auth.test.ts` - 9 tests
| Test | Compila | Cobertura |
|------|---------|-----------|
| POST /register - registro correcto | OK | Camino feliz |
| POST /register - email duplicado | OK | Error 409 |
| POST /register - contrasena debil | OK | Validacion |
| POST /register - sin email | OK | Validacion |
| POST /login - credenciales validas | OK | Camino feliz |
| POST /login - contrasena incorrecta | OK | Error 401 |
| POST /login - usuario inexistente | OK | Error 401 |
| GET /me - usuario autenticado | OK | Camino feliz |
| GET /me - sin token | OK | Error 401 |
| GET /me - token invalido | OK | Error 401 |

**Faltantes:** Test de refresh token, test de logout, test de token expirado.

#### `expense.test.ts` - 7 tests
| Test | Compila | Cobertura |
|------|---------|-----------|
| POST /expenses - crea gasto | OK | Camino feliz |
| POST /expenses - sin autenticacion | OK | Error 401 |
| POST /expenses - monto negativo | OK | Validacion |
| POST /expenses - sin descripcion | OK | Validacion |
| GET /expenses - lista gastos | OK | Camino feliz |
| GET /expenses - paginacion | OK | Paginacion |
| GET /expenses/balances - calcula balances | OK | Logica negocio |

**Faltantes:** GET/PATCH/DELETE gasto por ID, division por porcentajes, division por cantidades fijas, transferencias sugeridas, settlements CRUD.

#### `announcements.test.ts` - 14 tests
| Test | Compila | Notas |
|------|---------|-------|
| CRUD anuncios (crear, listar, detalle, actualizar, eliminar) | OK | Completo |
| Permisos (miembro no puede eliminar/fijar anuncio de otro) | OK | Buena cobertura |
| Votaciones (crear POLL, votar, cambiar voto, eliminar voto) | OK | Completo |
| Resultados de votacion | OK | Incluye porcentaje participacion |
| Validaciones (sin titulo, sin opciones suficientes, sin auth) | OK | Buena cobertura |
| Encuesta sin opciones suficientes | OK | Edge case |

**Observacion:** Este es el test mas completo del proyecto. Excelente cobertura.

#### `calendar.test.ts` - 10 tests
| Test | Compila | Notas |
|------|---------|-------|
| CRUD eventos (crear, listar, detalle, actualizar, eliminar) | OK | Completo |
| Evento dia completo | OK | Feature especifica |
| Filtro por mes/anio | OK | Query params |
| Vista agregada con parametros requeridos | OK | Validacion |
| Validaciones (sin titulo, sin auth, 404) | OK | Errores |

**Observacion:** Buena cobertura. Cubre el calendario completo.

#### `reservations.test.ts` - 12 tests
| Test | Compila | Notas |
|------|---------|-------|
| Spaces CRUD (crear, listar, detalle, actualizar, eliminar) | OK | Completo |
| Permisos (solo admin crea/elimina espacios) | OK | Autorizacion |
| Reservas: crear, solapamiento, sin solapamiento | OK | Logica critica |
| Reserva con inicio>fin, duracion maxima | OK | Validacion |
| Listar reservas, cancelar reserva propia | OK | Operaciones basicas |

**Observacion:** Excelente test de solapamiento de reservas. Cubre bien la logica de negocio.

#### `rules.test.ts` - 12 tests
| Test | Compila | Notas |
|------|---------|-------|
| CRUD reglas (crear, listar, detalle, actualizar, eliminar) | OK | Completo |
| Permisos (no-autor no puede actualizar) | OK | Autorizacion |
| Aceptacion de reglas (aceptar, idempotencia, estado) | OK | Logica especifica |
| Ordenamiento por prioridad | OK | Feature especifica |
| Validaciones (sin titulo, sin descripcion, sin auth, 404) | OK | Errores |

**Observacion:** Cobertura muy buena incluyendo idempotencia de aceptacion.

#### `notifications.test.ts` - 10 tests
| Test | Compila | Notas |
|------|---------|-------|
| Listar notificaciones (propias, filtro lectura) | OK | Camino feliz |
| No muestra notificaciones de otro usuario | OK | Aislamiento |
| Contar no leidas | OK | Feature |
| Marcar como leida (propia, de otro) | OK | Permisos |
| Marcar todas como leidas | OK | Operacion batch |
| Eliminar notificacion (propia, de otro) | OK | Permisos |

**Observacion:** Buena cobertura de aislamiento entre usuarios.

#### `reports.test.ts` - 6 tests
| Test | Compila | Notas |
|------|---------|-------|
| Estructura correcta del reporte | OK | Verifica todos los campos |
| Datos de gastos por miembro | OK | Con gasto creado |
| Mes invalido (13) | OK | Validacion |
| Mes 0 (fallback a default) | OK | Titulo confuso* |
| Default mes/anio actual | OK | Sin query params |
| Sin autenticacion | OK | Error 401 |
| Ranking de karma | OK | Incluye estructura |

**\*Problema encontrado:** El test "acepta mes 0 y retorna datos" tiene titulo misleading. `month=0` es falsy en JS, por lo que `parseInt("0") || defaultMonth` usa el default. El test pasa pero el titulo sugiere que mes=0 es valido, cuando en realidad fallback al mes actual. Deberia renombrarse a "usa mes actual por defecto cuando month=0" o similar.

### 2.4 Tests de Integracion FALTANTES

| Modulo | Prioridad | Descripcion |
|--------|-----------|-------------|
| **Homes** | ALTA | CRUD hogares, join/leave, gestion miembros, invite code |
| **Tasks** | ALTA | CRUD tareas, asignaciones, rotacion, karma, completar |
| **Shopping** | ALTA | CRUD items, marcar comprado, conversion a gasto |
| **Settlements** | MEDIA | CRUD, confirmar, rechazar, cancelar (parcialmente cubierto via expenses) |
| **Auth refresh/logout** | MEDIA | Refresh token, logout con revocacion |

### 2.5 Tests Unitarios FALTANTES

| Funcion | Prioridad | Ubicacion |
|---------|-----------|-----------|
| `getSuggestedTransfers` (simplifyDebts) | ALTA | `expense.service.ts:432-482` |
| `calculateShares` | ALTA | `expense.service.ts:12-56` |
| `validateParticipants` | MEDIA | `expense.service.ts:59-81` |
| Error classes (AppError, etc.) | BAJA | `middlewares/errorHandler.ts` |

---

## 3. Tests Frontend (Vitest + Testing Library)

### 3.1 Configuracion

**Archivo:** `packages/client/vite.config.ts` (seccion test)

| Aspecto | Estado | Notas |
|---------|--------|-------|
| environment: jsdom | OK | Correcto para React |
| globals: true | OK | describe/it/expect globales |
| setupFiles | OK | Apunta a src/test/setup.ts |
| include pattern | OK | `src/**/*.{test,spec}.{ts,tsx}` |
| css: false | OK | No procesa CSS en tests |
| coverage provider: v8 | OK | Rapido |
| coverage exclude | OK | Excluye test/, .d.ts, main.tsx, index.ts |

### 3.2 Test Setup y Helpers

| Archivo | Estado | Descripcion |
|---------|--------|-------------|
| `src/test/setup.ts` | OK | Jest-dom matchers, cleanup, mocks de matchMedia/ResizeObserver/IntersectionObserver/scrollTo |
| `src/test/render.tsx` | OK | renderWithProviders con QueryClient + MemoryRouter |

**Observaciones:**
- El setup mock de `matchMedia` es correcto y necesario para shadcn/ui.
- `renderWithProviders` crea nuevo QueryClient por render (retry:false), evita estado compartido.
- No hay mock de `localStorage` -- puede ser necesario si theme.store usa persist.

### 3.3 Tests Existentes

#### `App.test.tsx` - 5 tests
| Test | Compila | Notas |
|------|---------|-------|
| Renderiza pagina principal en / | OK | Verifica .min-h-screen |
| Renderiza pagina de login en /login | OK | Verifica .min-h-screen |
| Renderiza 404 para rutas inexistentes | OK | Verifica .min-h-screen |
| Redirige rutas protegidas sin auth | OK | Verifica state |
| Permite acceso a rutas protegidas con auth | OK | Verifica state |

**Observacion:** Los tests verifican `.min-h-screen` que es muy generico. Podrian verificar contenido mas especifico (textos, componentes). Pero los mocks extensivos son necesarios dado el tamano de la app y son correctos.

#### `stores/auth.store.test.ts` - 7 tests
| Test | Compila | Notas |
|------|---------|-------|
| Estado inicial correcto | OK | user=null, token=null, isAuth=false, isLoading=true |
| setAuth establece todo | OK | Verifica user, token, isAuth, isLoading |
| logout limpia estado | OK | Todo a null/false |
| setUser actualiza usuario | OK | Actualiza isAuthenticated |
| setUser con null | OK | Marca no autenticado |
| setAccessToken solo token | OK | No cambia isAuthenticated |
| setLoading | OK | Toggle loading |

**Observacion:** Cobertura completa del store. Cada metodo testeado.

#### `stores/home.store.test.ts` - 8 tests
| Test | Compila | Notas |
|------|---------|-------|
| Estado inicial vacio | OK | null/[] |
| setHomes | OK | Establece lista |
| setCurrentHome | OK | Establece actual |
| addHome | OK | Anade a lista |
| updateHome en lista | OK | Actualiza por ID |
| updateHome en currentHome | OK | Actualiza si coincide |
| updateHome no modifica otro currentHome | OK | No afecta si no coincide |
| removeHome | OK | Elimina + limpia currentHome |

**Observacion:** Cobertura completa del store con buenos edge cases.

#### `stores/theme.store.test.ts` - 4 tests
| Test | Compila | Notas |
|------|---------|-------|
| Tema system por defecto | OK | Default |
| setTheme a dark | OK | Cambio |
| setTheme a light | OK | Cambio |
| setTheme vuelve a system | OK | Roundtrip |

**Observacion:** Cobertura completa pero basica. El store usa `persist` middleware -- los tests no verifican persistencia en localStorage.

#### `lib/utils.test.ts` - 7 tests
| Test | Compila | Notas |
|------|---------|-------|
| Combina clases simples | OK | Caso basico |
| Valores condicionales | OK | false/true |
| Conflictos Tailwind (p-4/p-2) | OK | tailwind-merge |
| Conflictos colores | OK | tailwind-merge |
| Arrays de clases | OK | Input array |
| Ignora falsy | OK | null/undefined/false |
| String vacio sin args | OK | Edge case |

**Observacion:** Excelente cobertura de la utilidad `cn`.

#### `services/auth.service.test.ts` - 5 tests
| Test | Compila | Notas |
|------|---------|-------|
| register envia datos correctos | OK | Mock axios |
| login envia credenciales | OK | Mock axios |
| logout envia peticion | OK | Mock axios |
| refresh renueva token | OK | Mock axios |
| me obtiene usuario | OK | Mock axios |

**Observacion:** Cobertura completa del servicio de auth. Mock de axios correcto.

### 3.4 Tests Frontend FALTANTES

| Componente/Modulo | Prioridad | Descripcion |
|-------------------|-----------|-------------|
| **services/home.service.ts** | ALTA | CRUD homes, join, leave, members |
| **services/expense.service.ts** | ALTA | CRUD expenses, balances |
| **services/task.service.ts** | ALTA | CRUD tasks, assignments |
| **services/shopping.service.ts** | MEDIA | CRUD shopping items |
| **services/announcement.service.ts** | MEDIA | CRUD announcements, voting |
| **services/calendar.service.ts** | BAJA | CRUD calendar events |
| **services/reservation.service.ts** | BAJA | CRUD reservations |
| **services/notification.service.ts** | BAJA | CRUD notifications |
| **services/house-rule.service.ts** | BAJA | CRUD rules |
| **services/report.service.ts** | BAJA | Reports |
| **Componentes de formulario** | MEDIA | ExpenseForm, TaskForm, etc. |
| **hooks/ (custom hooks)** | MEDIA | useSocket, useTheme, etc. |
| **pages/ (routing)** | BAJA | Navegacion completa |

---

## 4. Cobertura Estimada por Capa

### Backend

| Capa | Archivos totales | Cubiertos | Cobertura estimada |
|------|:----------------:|:---------:|:------------------:|
| Routes | 12 | 8 | ~67% |
| Controllers | 11 | 8 | ~73% |
| Services | 13 | 8 | ~62% |
| Middlewares | 5 | 0 (indirecto) | ~30%* |
| Lib/Utils | 4 | 0 | 0% |

\* Los middlewares se ejercitan indirectamente via los tests de integracion (auth, validate, errorHandler).

### Frontend

| Capa | Archivos totales | Cubiertos | Cobertura estimada |
|------|:----------------:|:---------:|:------------------:|
| Stores | 3 | 3 | 100% |
| Services | 11 | 1 | ~9% |
| Components | 50+ | 0 (parcial App) | <5% |
| Hooks | 5+ | 0 | 0% |
| Pages | 15+ | 0 (parcial App) | <5% |
| Utils | 1 | 1 | 100% |

### Cobertura Global Estimada

| Paquete | Estimacion |
|---------|:----------:|
| Backend | ~45-50% |
| Frontend | ~15-20% |
| **Total proyecto** | **~30-35%** |

**Meta requerida:** 70% backend, 70% frontend.

---

## 5. Problemas Encontrados

### 5.1 Bugs en Tests

| # | Archivo | Linea | Severidad | Descripcion |
|---|---------|-------|-----------|-------------|
| 1 | `reports.test.ts` | 77 | BAJA | Titulo misleading: "acepta mes 0" cuando en realidad testea fallback a default (month=0 es falsy en JS) |

### 5.2 Problemas de Calidad

| # | Ubicacion | Descripcion |
|---|-----------|-------------|
| 1 | `factories/index.ts` | `resetFactories()` usa `require()` dinamico que no es ideal en TS estricto. Mejor importar directamente. |
| 2 | `App.test.tsx` | Assertions verifican `.min-h-screen` que es demasiado generico. No valida contenido real. |
| 3 | Test suite general | No hay tests para token expirado (generateExpiredToken disponible pero sin usar) |
| 4 | Test suite general | No hay tests de concurrencia o rate limiting |

---

## 6. Plan de Tests Prioritarios a Agregar

### Prioridad 1 - Critica (para alcanzar cobertura 70% backend)

1. **`tests/integration/home.test.ts`** - Tests de hogares
   - Crear hogar
   - Listar hogares del usuario
   - Obtener detalle de hogar
   - Actualizar hogar (admin)
   - Eliminar hogar (admin)
   - Unirse con codigo de invitacion
   - Salir de hogar
   - Listar miembros
   - Permisos admin vs member
   - Validaciones (sin nombre, codigo invalido)

2. **`tests/integration/task.test.ts`** - Tests de tareas
   - CRUD de tareas
   - Crear asignacion
   - Marcar tarea completada (karma)
   - Listar asignaciones del usuario
   - Permisos

3. **`tests/integration/shopping.test.ts`** - Tests de compras
   - CRUD items de compra
   - Marcar como comprado
   - Conversion automatica a gasto
   - Validaciones

### Prioridad 2 - Alta (tests unitarios criticos)

4. **`tests/unit/simplifyDebts.test.ts`** - Algoritmo de simplificacion
   - 2 personas, deuda simple
   - 3 personas, deudas cruzadas
   - 4+ personas, minimizacion de transferencias
   - Todos con balance 0 (sin transferencias)
   - Un solo deudor, multiples acreedores
   - Precision de redondeo (centimos)

5. **`tests/unit/calculateShares.test.ts`** - Funciones de division
   - EQUAL con 2, 3, 4 personas
   - EQUAL con centimos (redondeo)
   - PERCENTAGE que sumen 100%
   - PERCENTAGE con error de porcentaje
   - FIXED_AMOUNTS correctos
   - FIXED_AMOUNTS que no suman total

### Prioridad 3 - Media (mejorar frontend)

6. **Frontend services tests** - Siguiendo patron de auth.service.test.ts:
   - `home.service.test.ts`
   - `expense.service.test.ts`
   - `task.service.test.ts`

7. **Frontend component tests:**
   - Formularios principales (LoginForm, RegisterForm)
   - ExpenseList/ExpenseForm
   - TaskList

### Prioridad 4 - Complementaria

8. **Auth completar:**
   - Test refresh token
   - Test logout
   - Test token expirado
   - Test rate limiting (si implementado)

9. **Settlements tests:**
   - Crear liquidacion
   - Confirmar (solo destinatario)
   - Rechazar (solo destinatario)
   - Cancelar (solo pagador)

---

## 7. Recomendaciones Generales

1. **Renombrar test misleading** en reports.test.ts ("acepta mes 0" -> "usa default cuando month=0")
2. **Refactorizar resetFactories** para no usar require() dinamico
3. **Agregar tests de token expirado** usando el helper generateExpiredToken que ya existe
4. **Extraer calculateShares y validateParticipants** del expense.service para poder hacer unit tests independientes
5. **Priorizar los 3 tests de integracion faltantes** (homes, tasks, shopping) para alcanzar la meta de 70%
6. **Agregar test de simplifyDebts** como test unitario puro (sin DB)

---

## 8. Conclusion

La infraestructura de testing esta **bien diseñada y configurada**:
- Jest config completo con global setup/teardown Docker
- Factories bien estructuradas para crear datos de test
- Helpers de auth reutilizables
- Frontend con Vitest, Testing Library, y renderWithProviders helper
- Docker Compose de test con PostgreSQL en tmpfs para velocidad

Los tests existentes son de **buena calidad**: cubren caminos felices, validaciones, permisos, y edge cases relevantes.

El gap principal esta en **3 modulos backend sin tests** (homes, tasks, shopping) y en la **cobertura frontend de servicios** (solo 1 de 11 cubiertos). Cubrir estos gaps elevaria la cobertura estimada de ~35% a ~65-70%.

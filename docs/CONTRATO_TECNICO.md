# Contrato Técnico - ConviviApp

> Fuente de verdad técnica del proyecto. Todas las decisiones arquitectónicas y convenciones están documentadas aquí.

---

## 1. Stack Tecnológico

### 1.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.x | UI Library |
| TypeScript | 5.x | Tipado estático |
| Vite | 5.x | Build tool + Dev server |
| Tailwind CSS | 3.x | Estilos utility-first |
| shadcn/ui | latest | Componentes UI accesibles |
| Zustand | 4.x | Estado global (2KB) |
| React Query | 5.x | Caché y sincronización API |
| React Router | 6.x | Routing SPA |
| Zod | 3.x | Validación de esquemas |
| Socket.io-client | 4.x | WebSocket cliente |

### 1.2 Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20.x LTS | Runtime |
| Express | 4.x | Framework HTTP |
| TypeScript | 5.x | Tipado estático |
| Prisma | 5.x | ORM type-safe |
| PostgreSQL | 15.x | Base de datos (Supabase) |
| Passport | 0.7.x | Estrategias de autenticación |
| JWT | - | Tokens stateless |
| Socket.io | 4.x | WebSocket servidor |
| Zod | 3.x | Validación de requests |

### 1.3 Testing

| Tecnología | Ámbito | Cobertura Mínima |
|------------|--------|------------------|
| Jest | Backend (unit + integration) | 80% |
| Vitest | Frontend (unit) | 70% |
| Testing Library | Frontend (componentes) | 70% |
| Supertest | Backend (HTTP) | - |
| Playwright | E2E (opcional) | Flujos críticos |

### 1.4 Infraestructura

| Tecnología | Propósito |
|------------|-----------|
| pnpm | Package manager |
| Turborepo | Monorepo build system |
| Docker | Contenedores de desarrollo |
| GitHub Actions | CI/CD |
| Railway/Render | Hosting (tier gratuito) |
| Supabase | PostgreSQL + Auth (opcional) |
| Cloudinary | Almacenamiento de imágenes |

---

## 2. Arquitectura del Proyecto

### 2.1 Estructura de Monorepo

```
conviviapp/
├── packages/
│   ├── shared/              # Código compartido
│   │   ├── src/
│   │   │   ├── types/       # Interfaces TypeScript
│   │   │   ├── validators/  # Esquemas Zod
│   │   │   └── utils/       # Utilidades comunes
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── client/              # Frontend React
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/      # shadcn/ui
│   │   │   │   ├── layout/  # Header, Sidebar, etc.
│   │   │   │   └── features/
│   │   │   │       ├── auth/
│   │   │   │       ├── expenses/
│   │   │   │       ├── tasks/
│   │   │   │       └── shopping/
│   │   │   ├── pages/       # Componentes de página
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── services/    # Llamadas API
│   │   │   ├── stores/      # Zustand stores
│   │   │   ├── lib/         # Utilidades
│   │   │   └── App.tsx
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   └── server/              # Backend Node.js
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── src/
│       │   ├── config/      # Configuración
│       │   ├── controllers/ # Handlers HTTP
│       │   ├── middlewares/ # Auth, validación, errores
│       │   ├── routes/      # Definición de rutas
│       │   ├── services/    # Lógica de negocio
│       │   ├── sockets/     # Handlers Socket.io
│       │   ├── utils/       # Utilidades
│       │   └── app.ts       # Entry point
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       ├── package.json
│       └── tsconfig.json
│
├── .github/workflows/
├── docs/
├── package.json             # Root
├── pnpm-workspace.yaml
├── turbo.json
└── docker-compose.yml
```

### 2.2 Patrones de Arquitectura

#### Backend - Arquitectura por Capas

```
Request → Routes → Controllers → Services → Repositories → Prisma → DB
                       ↓
                  Middlewares (auth, validation, error)
```

| Capa | Responsabilidad |
|------|-----------------|
| Routes | Definición de endpoints |
| Controllers | Manejo de request/response HTTP |
| Services | Lógica de negocio |
| Repositories | Acceso a datos (abstracción de Prisma) |
| Middlewares | Validación, autenticación, manejo de errores |

#### Frontend - Feature-based Structure

```
src/
├── components/
│   ├── ui/           # Componentes genéricos reutilizables
│   ├── layout/       # Componentes de estructura
│   └── features/     # Componentes por dominio
│       └── expenses/
│           ├── ExpenseList.tsx
│           ├── ExpenseForm.tsx
│           ├── ExpenseCard.tsx
│           └── index.ts
├── hooks/            # Custom hooks compartidos
├── services/         # API calls
├── stores/           # Estado global (Zustand)
└── pages/            # Componentes de página (rutas)
```

---

## 3. Convenciones de Código

### 3.1 Nombrado

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos TS/JS | camelCase | `expenseService.ts` |
| Componentes React | PascalCase | `ExpenseList.tsx` |
| Funciones/variables | camelCase | `calculateBalance()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_EXPENSE_AMOUNT` |
| Tipos/Interfaces | PascalCase | `interface ExpenseData` |
| Enums | PascalCase | `enum TaskStatus` |
| Tablas DB | snake_case, plural | `expenses`, `task_assignments` |
| Columnas DB | snake_case | `created_at`, `user_id` |
| Rutas API | kebab-case, plural | `/api/homes/:id/expenses` |
| Variables de entorno | UPPER_SNAKE_CASE | `DATABASE_URL` |

### 3.2 TypeScript

```typescript
// CORRECTO: Usar interfaces para objetos
interface User {
  id: string;
  email: string;
  name: string;
}

// CORRECTO: Usar type para uniones/intersecciones
type ApiResponse<T> = { data: T } | { error: string };

// INCORRECTO: No usar any
const data: any = fetchData(); // ❌

// CORRECTO: Usar unknown y validar
const data: unknown = fetchData();
if (isUser(data)) { /* ... */ }
```

### 3.3 React

```tsx
// CORRECTO: Componentes funcionales con tipado explícito
interface ExpenseCardProps {
  expense: Expense;
  onEdit: (id: string) => void;
}

export function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  return (/* ... */);
}

// CORRECTO: Custom hooks para lógica reutilizable
function useExpenses(homeId: string) {
  return useQuery({
    queryKey: ['expenses', homeId],
    queryFn: () => expenseApi.getByHome(homeId),
  });
}
```

### 3.4 Imports

```typescript
// Orden de imports:
// 1. Módulos externos (react, librerías)
// 2. Alias internos (@/...)
// 3. Imports relativos

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';

import { ExpenseCard } from './ExpenseCard';
```

---

## 4. API REST

### 4.1 Formato de Respuesta

```typescript
// Éxito
{
  "success": true,
  "data": { /* payload */ }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es inválido",
    "details": [{ "field": "email", "message": "Formato inválido" }]
  }
}

// Paginación
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 4.2 Códigos de Estado HTTP

| Código | Uso |
|--------|-----|
| 200 | OK - Lectura exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Conflicto (ej: email duplicado) |
| 500 | Internal Server Error |

### 4.3 Endpoints MVP

```
Auth:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

Homes:
POST   /api/homes
GET    /api/homes
GET    /api/homes/:id
PUT    /api/homes/:id
DELETE /api/homes/:id
POST   /api/homes/:id/join
POST   /api/homes/:id/leave
GET    /api/homes/:id/members

Expenses:
POST   /api/homes/:id/expenses
GET    /api/homes/:id/expenses
GET    /api/homes/:id/expenses/:eid
PUT    /api/homes/:id/expenses/:eid
DELETE /api/homes/:id/expenses/:eid
GET    /api/homes/:id/balances
GET    /api/homes/:id/settlements
POST   /api/homes/:id/settlements

Tasks:
POST   /api/homes/:id/tasks
GET    /api/homes/:id/tasks
PUT    /api/homes/:id/tasks/:tid
DELETE /api/homes/:id/tasks/:tid
POST   /api/homes/:id/tasks/:tid/complete

Shopping:
POST   /api/homes/:id/shopping
GET    /api/homes/:id/shopping
PUT    /api/homes/:id/shopping/:sid
DELETE /api/homes/:id/shopping/:sid
POST   /api/homes/:id/shopping/:sid/buy
```

---

## 5. Base de Datos

### 5.1 Convenciones Prisma

```prisma
// Nombres de modelos: PascalCase, singular
model User { }
model HomeMember { }

// Nombres de campos: camelCase
model User {
  id        String   @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Índices para campos frecuentemente consultados
@@index([homeId])
@@index([createdAt])

// Unique constraints para integridad
@@unique([userId, homeId])
```

### 5.2 Migraciones

```bash
# Crear migración (desarrollo)
pnpm --filter server prisma migrate dev --name descripcion_cambio

# Aplicar migraciones (producción)
pnpm --filter server prisma migrate deploy

# Reset (solo desarrollo)
pnpm --filter server prisma migrate reset
```

---

## 6. Autenticación

### 6.1 Flujo JWT

```
1. POST /auth/login → { accessToken, refreshToken }
2. Requests con header: Authorization: Bearer <accessToken>
3. AccessToken expira (15min) → POST /auth/refresh con refreshToken
4. RefreshToken expira (7d) → Re-login
```

### 6.2 Almacenamiento

| Token | Almacenamiento | Duración |
|-------|---------------|----------|
| Access Token | Memory (Zustand) | 15 min |
| Refresh Token | httpOnly Cookie | 7 días |

---

## 7. Real-time (Socket.io)

### 7.1 Eventos

```typescript
// Cliente → Servidor
'join-home'    // { homeId: string }
'leave-home'   // { homeId: string }

// Servidor → Cliente (rooms por homeId)
'expense:created'    // { expense: Expense }
'expense:updated'    // { expense: Expense }
'expense:deleted'    // { expenseId: string }
'task:assigned'      // { task: Task }
'shopping:updated'   // { item: ShoppingItem }
'notification'       // { notification: Notification }
```

### 7.2 Rooms

- Cada hogar es un room: `home:${homeId}`
- Al unirse a un hogar, el socket se une al room
- Eventos se emiten al room correspondiente

---

## 8. Testing

### 8.1 Convención de Nombres

```typescript
// Formato: describe + it con escenario y resultado esperado
describe('ExpenseService', () => {
  it('createExpense con datos válidos retorna el gasto creado', async () => {});
  it('createExpense con monto negativo lanza ValidationError', async () => {});
  it('simplifyDebts con múltiples usuarios minimiza transferencias', async () => {});
});
```

### 8.2 Estructura de Tests

```
tests/
├── unit/
│   ├── services/
│   │   └── expenseService.test.ts
│   └── utils/
│       └── simplifyDebts.test.ts
└── integration/
    ├── auth.test.ts
    ├── expenses.test.ts
    └── homes.test.ts
```

---

## 9. Seguridad

### 9.1 Checklist Obligatorio

- [ ] Validación de inputs con Zod en todas las rutas
- [ ] Sanitización de datos antes de insertar en DB
- [ ] Rate limiting en endpoints sensibles (auth)
- [ ] CORS configurado solo para dominios permitidos
- [ ] Passwords hasheados con bcrypt (cost factor >= 10)
- [ ] SQL injection prevenido (Prisma parametriza automáticamente)
- [ ] XSS prevenido (React escapa por defecto)
- [ ] Secrets en variables de entorno (nunca en código)

### 9.2 Headers de Seguridad

```typescript
// Configurar con helmet
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
}));
```

---

## 10. CI/CD

### 10.1 Pipeline CI

```yaml
# Ejecuta en cada PR a staging/main
jobs:
  - Lint (ESLint)
  - Type check (tsc --noEmit)
  - Tests (Jest/Vitest con cobertura)
  - Build (Turborepo)
```

### 10.2 Condiciones de Merge

| Check | staging | main |
|-------|:-------:|:----:|
| Lint pass | ✅ | ✅ |
| Type check pass | ✅ | ✅ |
| Tests pass | ✅ | ✅ |
| Coverage >= 70% | ✅ | ✅ |
| Build success | ✅ | ✅ |
| Aprobación manual | ❌ | ✅ |

---

## 11. Modelo de Datos

Ver `docs/MEMORIA_PROYECTO.md` sección 4 para el schema Prisma completo.

**Entidades principales:**
- User, Home, HomeMember
- Expense, ExpenseParticipant, Category, Settlement
- Task, TaskAssignment
- ShoppingItem, Announcement, Vote
- InventoryItem, Notification

---

## 12. Decisiones Arquitectónicas (ADR)

### ADR-001: Monorepo con pnpm + Turborepo
- **Contexto:** Proyecto fullstack con código compartido
- **Decisión:** Monorepo para compartir tipos y utilidades
- **Consecuencias:** Mayor complejidad inicial, mejor DX a largo plazo

### ADR-002: Zustand sobre Redux
- **Contexto:** Gestión de estado cliente
- **Decisión:** Zustand por su simplicidad (2KB vs 40KB)
- **Consecuencias:** Menos boilerplate, curva de aprendizaje menor

### ADR-003: Prisma sobre TypeORM/Knex
- **Contexto:** ORM para PostgreSQL
- **Decisión:** Prisma por type-safety y DX
- **Consecuencias:** Migraciones automáticas, cliente tipado

### ADR-004: shadcn/ui sobre otras librerías
- **Contexto:** Componentes UI
- **Decisión:** shadcn/ui (copiar código, no dependencia)
- **Consecuencias:** Sin vendor lock-in, control total del código

---

> **Última actualización:** 2026-02-05
>
> **Nota:** Este documento es la fuente de verdad técnica. Cualquier cambio arquitectónico debe reflejarse aquí antes de implementarse.

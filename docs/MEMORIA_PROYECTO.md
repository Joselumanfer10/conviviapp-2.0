# ConviviApp - Memoria del Proyecto TFM

> **Máster en Desarrollo con IA** - Big School (Director: Brais Mouredev)
>
> Documento de especificación técnica completa

---

## 1. VISIÓN DEL PRODUCTO

### 1.1 Descripción
**ConviviApp** es una plataforma web fullstack que digitaliza y optimiza todos los aspectos de la convivencia en pisos compartidos, eliminando las fricciones económicas, organizativas y comunicativas.

### 1.2 Propuesta de Valor Única (UVP)
```
"La única plataforma que unifica gestión económica, tareas domésticas
y comunicación en un ecosistema diseñado específicamente para la
convivencia compartida - desde el primer día hasta la mudanza"
```

### 1.3 Problema que Resuelve

| Problema | Impacto |
|----------|---------|
| Deudas cruzadas complejas | 67-73% de conflictos en pisos son por dinero |
| Tareas desequilibradas | 45% siente que hace más que los demás |
| Comunicación deficiente | Uso de 4+ apps (WhatsApp, notas, Excel...) |
| Liquidaciones injustas | 78% de salidas generan disputas económicas |
| Compras duplicadas | 23% de desperdicio por falta de coordinación |

### 1.4 Público Objetivo

```yaml
Perfil Principal:
  Demografía:
    - Edad: 18-35 años
    - Ocupación: Estudiantes universitarios y jóvenes profesionales
    - Ubicación: Zonas urbanas con alto coste de vivienda
    - Situación: Pisos compartidos (2-8 personas)

  Tamaño del mercado (España):
    - ~600K estudiantes en pisos compartidos
    - ~800K jóvenes profesionales
    - Media de 3.5 personas/piso
```

### 1.5 Diferenciación vs Competencia

| Funcionalidad | Splitwise | Flatastic | ConviviApp |
|---------------|:---------:|:---------:|:----------:|
| Gastos compartidos | ✅ | ✅ | ✅ |
| Simplificación deudas | ✅ | ❌ | ✅ Optimizada |
| Tareas rotativas | ❌ | ✅ Básico | ✅ Inteligente |
| Lista compras | ❌ | ✅ Básico | ✅ Colaborativa |
| Votaciones | ❌ | ❌ | ✅ |
| Inventario común | ❌ | ❌ | ✅ |
| Liquidación salida | ❌ | ❌ | ✅ Automática |
| Tiempo real | ❌ | ❌ | ✅ WebSocket |

**Ventaja clave:** Flatastic (único competidor integral) está **abandonada desde 2021**.

---

## 2. MÓDULOS Y FUNCIONALIDADES

### 2.1 Módulo: Gestión de Gastos y Deudas

| Feature | Descripción |
|---------|-------------|
| Gasto simple | "Pagué X por concepto Y" |
| División personalizada | Porcentajes, cantidades fijas, exclusiones |
| Gastos recurrentes | Alquiler, servicios, suscripciones |
| Adjuntar tickets | Foto de factura/ticket |
| Balance global | Quién debe a quién |
| Simplificación de deudas | Algoritmo que minimiza transferencias |
| Historial filtrable | Por fecha, categoría, persona |

**Reglas de negocio:**
- División por defecto: partes iguales
- Divisiones permitidas: iguales, porcentajes, cantidades fijas, por habitación
- Monto mínimo: 0.01€ / Máximo: 50,000€
- Gastos recurrentes con auto-registro

### 2.2 Módulo: Tareas Domésticas

| Feature | Descripción |
|---------|-------------|
| Catálogo de tareas | Limpieza, basura, compras, etc. |
| Rotación automática | Algoritmo de equidad |
| Sistema de karma | Puntos por tareas completadas |
| Intercambios | Negociación entre compañeros |
| Recordatorios | Notificaciones push |
| Historial | Quién hizo qué y cuándo |

### 2.3 Módulo: Lista de Compras Compartida

| Feature | Descripción |
|---------|-------------|
| Items con categorías | Organización por tipo |
| Asignación opcional | Quién lo comprará |
| Marcar como comprado | Con precio y tienda |
| Conversión a gasto | Automática al marcar comprado |
| Lista persistente | Items frecuentes |

### 2.4 Módulo: Tablón y Votaciones

| Feature | Descripción |
|---------|-------------|
| Anuncios | Mensajes para todos |
| Encuestas | Con fecha límite |
| Votaciones | Quórum configurable |
| Comentarios | En cada publicación |
| Notificaciones | Al crear/actualizar |

### 2.5 Módulo: Inventario Común

| Feature | Descripción |
|---------|-------------|
| Registro de bienes | Electrodomésticos, muebles |
| Propietario | Quién lo aportó |
| Valor | Precio original y actual |
| Estado | Nuevo, usado, etc. |
| Fotos | Documentación visual |

### 2.6 Módulo: Liquidación de Entrada/Salida

| Feature | Descripción |
|---------|-------------|
| Cálculo automático | Balance final del miembro |
| Fianza | Gestión proporcional |
| Inventario | Qué se lleva/deja |
| Historial | Registro de ex-miembros |

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (PWA)                          │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite 5                                 │
│  Tailwind CSS + shadcn/ui                                       │
│  Zustand (estado) + React Query v5 (caché API)                  │
│  React Router v6 + Zod (validación)                             │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           BACKEND                               │
├─────────────────────────────────────────────────────────────────┤
│  Node.js 20 + Express + TypeScript                              │
│  Prisma 5.x (ORM)                                               │
│  Socket.io (real-time)                                          │
│  Passport + JWT (auth)                                          │
│  Zod (validación) + Jest (testing)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │      Redis       │ │   Cloudinary     │
│   (Supabase)     │ │  (caché/queue)   │ │   (imágenes)     │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      INFRAESTRUCTURA                            │
├─────────────────────────────────────────────────────────────────┤
│  Docker + Railway/Render + GitHub Actions + Sentry              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Justificación del Stack

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | React 18 + Vite | Ecosistema maduro, HMR ultrarrápido |
| Estado | Zustand + React Query | Ligero (2KB), caché automático |
| UI | Tailwind + shadcn/ui | Componentes accesibles, sin vendor lock-in |
| Backend | Node.js + Express | Mismo lenguaje (TS), fácil de desplegar |
| ORM | Prisma | Type-safety excelente, migraciones automáticas |
| Base de Datos | PostgreSQL | ACID, JSON support, gratis en Supabase |
| Real-time | Socket.io | Rooms nativos (perfectos para "pisos") |
| Auth | JWT + Passport | Stateless, escalable |
| Deploy | Railway/Render | Tier gratuito suficiente para TFM |

---

## 4. MODELO DE DATOS

### 4.1 Diagrama de Entidades

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │───────│  HomeMember  │───────│   Home   │
└──────────┘       └──────────────┘       └──────────┘
     │                    │                     │
     │              ┌─────┴─────┐               │
     │              │           │               │
     ▼              ▼           ▼               ▼
┌──────────┐  ┌──────────┐ ┌──────────┐  ┌──────────┐
│ Expense  │  │   Task   │ │   Vote   │  │Inventory │
└──────────┘  └──────────┘ └──────────┘  └──────────┘
     │              │
     ▼              ▼
┌──────────┐  ┌──────────┐
│Participant│  │Assignment│
└──────────┘  └──────────┘
```

### 4.2 Schema Prisma Completo

```prisma
// ==================== ENUMS ====================

enum HomeRole {
  ADMIN
  MEMBER
}

enum SplitMode {
  EQUAL
  PERCENTAGE
  FIXED_AMOUNTS
  BY_ROOM
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum TaskFrequency {
  ONCE
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
}

enum ShoppingItemStatus {
  PENDING
  BOUGHT
  CANCELLED
}

enum AnnouncementType {
  INFO
  POLL
  VOTE
}

enum SettlementStatus {
  PENDING
  CONFIRMED
  REJECTED
}

// ==================== MODELOS ====================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  name              String
  avatarUrl         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  homeMembers       HomeMember[]
  expensesPaid      Expense[]           @relation("ExpensePayer")
  expenseParticipations ExpenseParticipant[]
  taskAssignments   TaskAssignment[]
  shoppingItemsAdded ShoppingItem[]     @relation("ItemCreator")
  shoppingItemsBought ShoppingItem[]    @relation("ItemBuyer")
  announcements     Announcement[]
  votes             Vote[]
  inventoryItems    InventoryItem[]
  sentSettlements   Settlement[]        @relation("SettlementPayer")
  receivedSettlements Settlement[]      @relation("SettlementReceiver")
  notifications     Notification[]

  @@index([email])
}

model Home {
  id          String    @id @default(cuid())
  name        String
  description String?
  address     String?
  inviteCode  String    @unique @default(cuid())
  currency    String    @default("EUR")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  defaultSplitMode    SplitMode @default(EQUAL)
  taskRotationEnabled Boolean   @default(true)

  members       HomeMember[]
  expenses      Expense[]
  tasks         Task[]
  shoppingItems ShoppingItem[]
  announcements Announcement[]
  inventoryItems InventoryItem[]
  settlements   Settlement[]
  categories    Category[]

  @@index([inviteCode])
}

model HomeMember {
  id        String   @id @default(cuid())
  userId    String
  homeId    String
  role      HomeRole @default(MEMBER)
  nickname  String?
  roomCost  Float?
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  isActive  Boolean  @default(true)

  user      User     @relation(fields: [userId], references: [id])
  home      Home     @relation(fields: [homeId], references: [id])

  @@unique([userId, homeId])
  @@index([homeId])
}

model Category {
  id       String    @id @default(cuid())
  name     String
  icon     String?
  color    String?
  homeId   String

  home     Home      @relation(fields: [homeId], references: [id])
  expenses Expense[]

  @@unique([homeId, name])
}

model Expense {
  id          String    @id @default(cuid())
  homeId      String
  paidById    String
  amount      Float
  description String
  categoryId  String?
  splitMode   SplitMode @default(EQUAL)
  receiptUrl  String?
  isRecurring Boolean   @default(false)
  recurringDay Int?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  home         Home       @relation(fields: [homeId], references: [id])
  paidBy       User       @relation("ExpensePayer", fields: [paidById], references: [id])
  category     Category?  @relation(fields: [categoryId], references: [id])
  participants ExpenseParticipant[]

  @@index([homeId])
  @@index([paidById])
  @@index([createdAt])
}

model ExpenseParticipant {
  id        String @id @default(cuid())
  expenseId String
  userId    String
  share     Float

  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id])

  @@unique([expenseId, userId])
}

model Task {
  id          String        @id @default(cuid())
  homeId      String
  name        String
  description String?
  frequency   TaskFrequency @default(WEEKLY)
  difficulty  Int           @default(1)
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())

  home        Home             @relation(fields: [homeId], references: [id])
  assignments TaskAssignment[]

  @@index([homeId])
}

model TaskAssignment {
  id          String     @id @default(cuid())
  taskId      String
  assignedToId String
  dueDate     DateTime
  status      TaskStatus @default(PENDING)
  completedAt DateTime?
  notes       String?
  createdAt   DateTime   @default(now())

  task        Task       @relation(fields: [taskId], references: [id])
  assignedTo  User       @relation(fields: [assignedToId], references: [id])

  @@index([taskId])
  @@index([assignedToId])
  @@index([dueDate])
}

model ShoppingItem {
  id          String             @id @default(cuid())
  homeId      String
  name        String
  quantity    Int                @default(1)
  unit        String?
  category    String?
  status      ShoppingItemStatus @default(PENDING)
  addedById   String
  boughtById  String?
  price       Float?
  store       String?
  createdAt   DateTime           @default(now())
  boughtAt    DateTime?

  home        Home    @relation(fields: [homeId], references: [id])
  addedBy     User    @relation("ItemCreator", fields: [addedById], references: [id])
  boughtBy    User?   @relation("ItemBuyer", fields: [boughtById], references: [id])

  @@index([homeId])
  @@index([status])
}

model Announcement {
  id          String           @id @default(cuid())
  homeId      String
  authorId    String
  title       String
  content     String
  type        AnnouncementType @default(INFO)
  isPinned    Boolean          @default(false)
  expiresAt   DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  options     String[]
  quorum      Int?

  home        Home    @relation(fields: [homeId], references: [id])
  author      User    @relation(fields: [authorId], references: [id])
  votes       Vote[]

  @@index([homeId])
  @@index([createdAt])
}

model Vote {
  id             String   @id @default(cuid())
  announcementId String
  userId         String
  optionIndex    Int
  createdAt      DateTime @default(now())

  announcement   Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id])

  @@unique([announcementId, userId])
}

model InventoryItem {
  id          String   @id @default(cuid())
  homeId      String
  ownerId     String
  name        String
  description String?
  value       Float?
  condition   String?
  imageUrl    String?
  isShared    Boolean  @default(true)
  createdAt   DateTime @default(now())

  home        Home     @relation(fields: [homeId], references: [id])
  owner       User     @relation(fields: [ownerId], references: [id])

  @@index([homeId])
}

model Settlement {
  id         String           @id @default(cuid())
  homeId     String
  fromUserId String
  toUserId   String
  amount     Float
  status     SettlementStatus @default(PENDING)
  note       String?
  createdAt  DateTime         @default(now())
  confirmedAt DateTime?

  home       Home @relation(fields: [homeId], references: [id])
  fromUser   User @relation("SettlementPayer", fields: [fromUserId], references: [id])
  toUser     User @relation("SettlementReceiver", fields: [toUserId], references: [id])

  @@index([homeId])
  @@index([status])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([isRead])
}
```

---

## 5. ALGORITMO DE SIMPLIFICACIÓN DE DEUDAS

### 5.1 Concepto Fundamental

```
Balance = Total que pagó - Total que debía pagar
- Balance positivo → Se le debe dinero (ACREEDOR)
- Balance negativo → Debe dinero (DEUDOR)
```

### 5.2 Implementación TypeScript

```typescript
interface Balance {
  userId: string;
  amount: number; // positivo = acreedor, negativo = deudor
}

interface Transfer {
  from: string;   // deudor
  to: string;     // acreedor
  amount: number;
}

function simplifyDebts(balances: Balance[]): Transfer[] {
  const transfers: Transfer[] = [];
  const EPSILON = 0.01;

  // Copia de trabajo
  let working = balances
    .filter(b => Math.abs(b.amount) > EPSILON)
    .map(b => ({ ...b }));

  while (true) {
    // Ordenar: deudores (más negativo primero), acreedores (más positivo primero)
    const debtors = working.filter(b => b.amount < -EPSILON)
      .sort((a, b) => a.amount - b.amount);
    const creditors = working.filter(b => b.amount > EPSILON)
      .sort((a, b) => b.amount - a.amount);

    if (debtors.length === 0 || creditors.length === 0) break;

    const maxDebtor = debtors[0];
    const maxCreditor = creditors[0];

    // Transferencia = mínimo entre ambos montos
    const amount = Math.min(Math.abs(maxDebtor.amount), maxCreditor.amount);

    transfers.push({
      from: maxDebtor.userId,
      to: maxCreditor.userId,
      amount: Math.round(amount * 100) / 100
    });

    // Actualizar balances
    maxDebtor.amount += amount;
    maxCreditor.amount -= amount;

    // Filtrar saldados
    working = working.filter(b => Math.abs(b.amount) > EPSILON);
  }

  return transfers;
}
```

### 5.3 Ejemplo Numérico

```
GASTOS DEL MES:
┌─────────────────┬─────────┬────────┬──────────────────┐
│ Gasto           │ Pagó    │ Total  │ División (=)     │
├─────────────────┼─────────┼────────┼──────────────────┤
│ Supermercado    │ Ana     │ 120€   │ 30€ c/u          │
│ Internet        │ Bob     │ 60€    │ 15€ c/u          │
│ Cena delivery   │ Ana     │ 80€    │ 20€ c/u          │
│ Limpieza        │ Bob     │ 40€    │ 10€ c/u          │
└─────────────────┴─────────┴────────┴──────────────────┘
Total: 300€ → 75€ por persona

BALANCES:
┌─────────┬──────────┬───────────┬─────────────────┐
│ Persona │ Pagó     │ Debía     │ Balance         │
├─────────┼──────────┼───────────┼─────────────────┤
│ Ana     │ 200€     │ 75€       │ +125€ (acreedor)│
│ Bob     │ 100€     │ 75€       │ +25€ (acreedor) │
│ Carlos  │ 0€       │ 75€       │ -75€ (deudor)   │
│ Diana   │ 0€       │ 75€       │ -75€ (deudor)   │
└─────────┴──────────┴───────────┴─────────────────┘

SIMPLIFICACIÓN:
Sin optimizar: 6 transferencias posibles (A↔B↔C↔D)
Optimizado:    3 transferencias
  1. Carlos → Ana: 75€
  2. Diana → Ana: 50€
  3. Diana → Bob: 25€
```

---

## 6. MVP vs VERSIÓN COMPLETA

### 6.1 Features MVP (Obligatorias para TFM)

| Módulo | Features MVP |
|--------|--------------|
| **Auth** | Registro, login, logout, JWT |
| **Hogar** | Crear, unirse con código, ver miembros |
| **Gastos** | CRUD gastos, división igual, ver balance, simplificar deudas |
| **Tareas** | CRUD tareas, asignar, marcar completada |
| **Compras** | Lista compartida, marcar comprado |
| **Real-time** | Sync automático con Socket.io |
| **PWA** | Instalable, notificaciones push |

### 6.2 Features v2 (Opcionales)

| Feature | Prioridad |
|---------|-----------|
| Votaciones/Encuestas | Media |
| Inventario común | Media |
| División por porcentajes | Media |
| Gastos recurrentes | Media |
| Liquidación de salida | Baja |
| Integración Bizum | Baja |
| Estadísticas avanzadas | Baja |
| Multi-idioma | Baja |

### 6.3 Pantallas MVP

```
1. AUTH
   ├── /login
   ├── /register
   └── /forgot-password

2. HOME
   ├── /                     (Dashboard)
   ├── /home/create          (Crear hogar)
   ├── /home/join            (Unirse con código)
   └── /home/settings        (Configuración)

3. EXPENSES
   ├── /expenses             (Lista de gastos)
   ├── /expenses/new         (Nuevo gasto)
   ├── /expenses/:id         (Detalle)
   └── /balances             (Balances y liquidar)

4. TASKS
   ├── /tasks                (Lista de tareas)
   ├── /tasks/new            (Nueva tarea)
   └── /tasks/:id            (Detalle)

5. SHOPPING
   └── /shopping             (Lista de compras)

6. PROFILE
   └── /profile              (Mi perfil)
```

---

## 7. API REST - Endpoints MVP

### Auth
```
POST   /api/auth/register     Registro de usuario
POST   /api/auth/login        Iniciar sesión
POST   /api/auth/logout       Cerrar sesión
POST   /api/auth/refresh      Refrescar token
GET    /api/auth/me           Usuario actual
```

### Homes
```
POST   /api/homes             Crear hogar
GET    /api/homes             Mis hogares
GET    /api/homes/:id         Detalle de hogar
PUT    /api/homes/:id         Actualizar hogar
DELETE /api/homes/:id         Eliminar hogar
POST   /api/homes/:id/join    Unirse con código
POST   /api/homes/:id/leave   Salir del hogar
GET    /api/homes/:id/members Lista de miembros
```

### Expenses
```
POST   /api/homes/:id/expenses          Crear gasto
GET    /api/homes/:id/expenses          Lista de gastos
GET    /api/homes/:id/expenses/:eid     Detalle de gasto
PUT    /api/homes/:id/expenses/:eid     Actualizar gasto
DELETE /api/homes/:id/expenses/:eid     Eliminar gasto
GET    /api/homes/:id/balances          Ver balances
GET    /api/homes/:id/settlements       Transferencias sugeridas
POST   /api/homes/:id/settlements       Marcar como pagado
```

### Tasks
```
POST   /api/homes/:id/tasks             Crear tarea
GET    /api/homes/:id/tasks             Lista de tareas
PUT    /api/homes/:id/tasks/:tid        Actualizar tarea
DELETE /api/homes/:id/tasks/:tid        Eliminar tarea
POST   /api/homes/:id/tasks/:tid/complete  Marcar completada
```

### Shopping
```
POST   /api/homes/:id/shopping          Añadir item
GET    /api/homes/:id/shopping          Lista de compras
PUT    /api/homes/:id/shopping/:sid     Actualizar item
DELETE /api/homes/:id/shopping/:sid     Eliminar item
POST   /api/homes/:id/shopping/:sid/buy Marcar como comprado
```

---

## 8. ESTRUCTURA DEL PROYECTO

```
conviviapp/
├── README.md
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/
│   └── MEMORIA_PROYECTO.md
│
├── packages/
│   ├── shared/                    # Tipos y utilidades compartidas
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── client/                    # Frontend React
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn components
│   │   │   │   ├── layout/
│   │   │   │   └── features/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/            # Zustand stores
│   │   │   ├── lib/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── server/                    # Backend Node.js
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── sockets/
│       │   ├── utils/
│       │   └── app.ts
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                   # Workspaces root
├── pnpm-workspace.yaml
└── turbo.json                     # Turborepo config
```

---

## 9. PLAN DE DESARROLLO

### Fase 1: Setup y Auth (Semana 1-2)
- [ ] Configurar monorepo (pnpm + turbo)
- [ ] Setup backend (Express + Prisma + PostgreSQL)
- [ ] Setup frontend (Vite + React + Tailwind)
- [ ] Implementar auth (registro, login, JWT)
- [ ] Páginas de login/registro

### Fase 2: Core - Hogares (Semana 3)
- [ ] CRUD de hogares
- [ ] Sistema de invitación por código
- [ ] Gestión de miembros
- [ ] Dashboard principal

### Fase 3: Gastos (Semana 4-5)
- [ ] CRUD de gastos
- [ ] División de gastos (partes iguales)
- [ ] Visualización de balances
- [ ] Algoritmo de simplificación
- [ ] Marcar pagos como realizados

### Fase 4: Tareas (Semana 6)
- [ ] CRUD de tareas
- [ ] Asignación de tareas
- [ ] Marcar como completada
- [ ] Historial de tareas

### Fase 5: Compras (Semana 7)
- [ ] Lista de compras compartida
- [ ] Marcar como comprado
- [ ] Conversión a gasto

### Fase 6: Real-time y PWA (Semana 8)
- [ ] Integrar Socket.io
- [ ] Sync en tiempo real
- [ ] Configurar PWA
- [ ] Notificaciones push

### Fase 7: Pulido (Semana 9-10)
- [ ] Testing (Jest + Playwright)
- [ ] Responsive design
- [ ] Optimización de rendimiento
- [ ] Documentación
- [ ] Deploy a producción

---

## 10. MÉTRICAS DE ÉXITO

### Para validar el proyecto

| Métrica | Objetivo |
|---------|----------|
| Usuarios registrados | 10+ (amigos/compañeros) |
| Hogares creados | 3+ |
| Gastos registrados | 50+ |
| Tareas completadas | 20+ |
| Uso real | 2+ semanas de uso activo |

### Para la defensa del TFM

- [ ] Repositorio completo y documentado
- [ ] Demo funcional en producción
- [ ] Tests con cobertura >70%
- [ ] Datos reales de uso
- [ ] Documentación técnica completa

---

## 11. RECURSOS Y REFERENCIAS

### Documentación
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/docs)
- [Socket.io](https://socket.io/docs/v4/)

### Inspiración
- Splitwise (gastos)
- Tody (tareas)
- Notion (UI/UX)

---

> **Proyecto TFM** - Máster en Desarrollo con IA - Big School (Brais Mouredev)

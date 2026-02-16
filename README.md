# ConviviApp 2.0

Plataforma web fullstack para la gestion integral de pisos compartidos. Digitaliza y optimiza la convivencia eliminando fricciones economicas, organizativas y comunicativas.

**Proyecto TFM** - Master en Desarrollo con IA - Big School (Director: Brais Mouredev)

---

## Problema que Resuelve

| Problema | Solucion |
|----------|----------|
| Deudas cruzadas complejas | Gastos compartidos con simplificacion automatica de deudas |
| Tareas desequilibradas | Rotacion automatica con sistema de karma |
| Comunicacion deficiente | Tablon de anuncios, votaciones y notificaciones en tiempo real |
| Compras duplicadas | Lista de compras compartida con conversion a gasto |
| Falta de organizacion | Calendario, reserva de espacios y reglas del hogar |

---

## Stack Tecnologico

### Frontend
- **React 18** + TypeScript + Vite 5
- **Tailwind CSS** + shadcn/ui
- **Zustand** (estado global) + **React Query v5** (cache API)
- **React Router v6** + Zod (validacion)
- **Socket.io-client** (tiempo real)
- **Framer Motion** (animaciones)

### Backend
- **Node.js 20** + Express + TypeScript
- **Prisma 5** (ORM) + PostgreSQL 15
- **Socket.io** (WebSocket)
- **JWT** (autenticacion: access + refresh tokens)
- **Zod** (validacion de requests)

### Infraestructura
- **pnpm** + **Turborepo** (monorepo)
- **Docker** (desarrollo + produccion)
- **Redis** (cache)

---

## Requisitos Previos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** y Docker Compose (para PostgreSQL y Redis)

---

## Instalacion

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd conviviapp-2.0

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Levantar infraestructura (PostgreSQL + Redis)
docker compose up postgres redis -d

# 5. Ejecutar migraciones de base de datos
pnpm --filter server prisma migrate dev

# 6. Iniciar desarrollo
pnpm dev
```

### URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

---

## Comandos

```bash
pnpm dev                    # Iniciar todos los servicios en desarrollo
pnpm --filter client dev    # Solo frontend
pnpm --filter server dev    # Solo backend
pnpm build                  # Build de produccion
pnpm lint                   # Ejecutar linter
pnpm test                   # Ejecutar tests
pnpm test:coverage          # Tests con cobertura
pnpm format                 # Formatear codigo con Prettier
pnpm type-check             # Verificar tipos TypeScript
pnpm clean                  # Limpiar builds y node_modules
```

### Docker

```bash
# Desarrollo completo con Docker
docker compose up -d

# Solo infraestructura (DB + Redis)
docker compose up postgres redis -d

# Tests con base de datos de prueba
docker compose -f docker-compose.test.yml up -d
```

---

## Estructura del Proyecto

```
conviviapp-2.0/
├── packages/
│   ├── shared/              # Tipos, validadores y utilidades compartidas
│   │   └── src/
│   │       ├── types/       # Interfaces TypeScript
│   │       ├── validators/  # Esquemas Zod
│   │       └── utils/       # Utilidades comunes
│   │
│   ├── client/              # Frontend React
│   │   └── src/
│   │       ├── components/  # UI reutilizable (ui/, layout/)
│   │       ├── features/    # Modulos por dominio (auth, expenses, tasks...)
│   │       ├── pages/       # Componentes de pagina
│   │       ├── hooks/       # Custom hooks compartidos
│   │       ├── services/    # Llamadas API
│   │       ├── stores/      # Estado global (Zustand)
│   │       └── lib/         # Utilidades (axios, socket, animaciones)
│   │
│   └── server/              # Backend Express
│       ├── prisma/          # Schema y migraciones
│       └── src/
│           ├── config/      # Configuracion
│           ├── controllers/ # Handlers HTTP
│           ├── middlewares/  # Auth, validacion, errores
│           ├── routes/      # Definicion de rutas
│           ├── services/    # Logica de negocio
│           ├── sockets/     # WebSocket handlers
│           ├── events/      # Event bus para notificaciones
│           └── lib/         # Utilidades (JWT, Prisma, bcrypt)
│
├── docs/                    # Documentacion del proyecto
│   ├── TASKS.md            # Plan de desarrollo por fases
│   ├── CONTRATO_TECNICO.md # Especificacion tecnica
│   ├── MEMORIA_PROYECTO.md # Especificacion funcional
│   └── DEPLOY.md           # Guia de despliegue
│
├── docker-compose.yml       # Produccion
├── docker-compose.override.yml  # Desarrollo (auto-aplicado)
├── docker-compose.test.yml  # Testing
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml      # Monorepo workspaces
```

---

## Modulos Funcionales

| Modulo | Descripcion |
|--------|-------------|
| **Autenticacion** | Registro, login, JWT con refresh token rotativo |
| **Hogares** | Crear, unirse por codigo, gestionar miembros |
| **Gastos** | CRUD con division multiple, balances, simplificacion de deudas |
| **Tareas** | Rotacion automatica, sistema de karma, asignaciones |
| **Compras** | Lista compartida, conversion automatica a gasto |
| **Anuncios** | Tablon con encuestas y votaciones |
| **Calendario** | Eventos compartidos del hogar |
| **Reservas** | Espacios compartidos con gestion de slots |
| **Reglas** | Reglas del hogar con aceptacion por miembros |
| **Notificaciones** | Centro de notificaciones en tiempo real |
| **Reportes** | Estadisticas mensuales con graficos |

---

## API REST

Todos los endpoints bajo `/api`. Formato de respuesta estandarizado:

```json
// Exito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

### Endpoints Principales

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Usuario actual
- `POST /api/homes` - Crear hogar
- `POST /api/homes/:id/join` - Unirse a hogar
- `GET /api/homes/:id/expenses` - Gastos del hogar
- `GET /api/homes/:id/balances` - Balances
- `GET /api/homes/:id/tasks` - Tareas
- `GET /api/homes/:id/shopping` - Lista de compras

Ver `docs/CONTRATO_TECNICO.md` para la lista completa de endpoints.

---

## Git - Flujo de Trabajo

```bash
# 1. Crear feature branch desde staging
git checkout staging && git pull && git checkout -b feature/nombre

# 2. Desarrollar y commit
git add . && git commit -m "tipo: descripcion"

# 3. Merge a staging
git checkout staging && git merge feature/nombre

# 4. Cuando este validado, merge a main
git checkout main && git merge staging
```

Formato de commits: `tipo: descripcion en imperativo` (espanol, ~50 chars)
- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Documentacion

| Documento | Contenido |
|-----------|-----------|
| [TASKS.md](docs/TASKS.md) | Plan de desarrollo con estado de cada tarea |
| [CONTRATO_TECNICO.md](docs/CONTRATO_TECNICO.md) | Stack, arquitectura, convenciones, API |
| [MEMORIA_PROYECTO.md](docs/MEMORIA_PROYECTO.md) | Vision, modulos, modelo de datos, algoritmos |
| [DEPLOY.md](docs/DEPLOY.md) | Guia de despliegue con Docker y Easypanel |

---

## Licencia

MIT

---

> **Autor:** Jose Luis Manzanares
> **Proyecto TFM** - Master en Desarrollo con IA - Big School

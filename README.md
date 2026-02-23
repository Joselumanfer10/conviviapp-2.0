# ConviviApp 2.0

Plataforma web fullstack para la gestion integral de pisos compartidos. Digitaliza y optimiza la convivencia eliminando fricciones economicas, organizativas y comunicativas.

**Proyecto TFM** - Master en Desarrollo con IA - Big School (Director: Brais Mouredev)

**Autor:** Jose Luis Manzanares Fernandez — Febrero 2026

---

## Enlaces del Proyecto

| Recurso | URL |
|---------|-----|
| **Aplicacion** | [https://conviviapp.joseluismanzanaresfernandez.es](https://conviviapp.joseluismanzanaresfernandez.es) |
| **API Backend** | [https://conviviapp-api.joseluismanzanaresfernandez.es](https://conviviapp-api.joseluismanzanaresfernandez.es) |
| **Presentacion (Slides)** | [https://conviviapp-slides.joseluismanzanaresfernandez.es](https://conviviapp-slides.joseluismanzanaresfernandez.es) |
| **Codigo fuente** | [https://github.com/Joselumanfer10/conviviapp-2.0](https://github.com/Joselumanfer10/conviviapp-2.0) |

### Probar la aplicacion

1. Entra en [conviviapp.joseluismanzanaresfernandez.es](https://conviviapp.joseluismanzanaresfernandez.es)
2. Registrate con tu email
3. Unete a la casa de prueba con el codigo: **`CNPMNMG8`**
4. Explora gastos, tareas, compras y el resto de modulos con datos de ejemplo

---

## Descripcion General

### Problema que Resuelve

| Problema | Impacto | Solucion ConviviApp |
|----------|---------|---------------------|
| Deudas cruzadas complejas | 67-73% de conflictos son por dinero | Gastos compartidos + simplificacion automatica de deudas |
| Tareas desequilibradas | 45% siente que hace mas que los demas | Rotacion automatica con sistema de karma |
| Comunicacion deficiente | Uso de 4+ apps sin integracion | Tablon de anuncios, votaciones y notificaciones en tiempo real |
| Compras duplicadas | 23% de desperdicio | Lista de compras compartida con conversion a gasto |
| Falta de organizacion | Conflictos por espacios y normas | Calendario, reserva de espacios y reglas del hogar |

### Contexto y Evolucion

ConviviApp 2.0 es la evolucion de una primera version del proyecto que sirvio para definir el dominio del problema, investigar la competencia (Splitwise, Flatastic), disenar el modelo de datos y prototipar funcionalidades. Con las lecciones aprendidas, se reescribio desde cero con arquitectura mas solida: monorepo con paquete compartido, backend por capas, frontend modular por features y CI/CD automatizado.

### Desarrollo Asistido con IA

Desarrollado con **Claude Opus 4.6** (Anthropic) via **Claude Code** CLI. La IA ha participado como copiloto en:

- Arquitectura del monorepo y estructura de carpetas
- Generacion de codigo backend (controllers, services, middlewares) y frontend (componentes, hooks, stores)
- Configuracion de infraestructura (Docker, CI/CD, Prisma)
- Debugging y resolucion de errores
- Documentacion tecnica

El desarrollador ha liderado todas las decisiones de producto, arquitectura y diseno, validando cada pieza de codigo generada. La IA se ha utilizado como herramienta de productividad, alineada con el enfoque del master.

---

## Modulos Funcionales (14 implementados)

| Modulo | Descripcion |
|--------|-------------|
| **Autenticacion** | Registro, login, JWT con refresh token rotativo y deteccion de robo |
| **Hogares** | Crear, unirse por codigo de invitacion, gestionar miembros con roles |
| **Gastos** | CRUD con division multiple (igual, porcentajes, fija), balances y simplificacion de deudas |
| **Tareas** | Asignacion, frecuencias configurables, sistema de karma (+10 pts completar, -15 omitir) |
| **Compras** | Lista compartida en tiempo real, conversion automatica a gasto |
| **Anuncios** | Tablon con tipos: informativo, encuesta y votacion |
| **Votaciones** | Encuestas con quorum configurable y resultados en vivo |
| **Calendario** | Eventos compartidos del hogar |
| **Reservas** | Espacios compartidos con slots y duracion maxima |
| **Reglas** | Normas del hogar con 7 categorias, prioridades y aceptacion por miembros |
| **Reportes** | Estadisticas mensuales con graficas (donut, barras, KPIs) |
| **Notificaciones** | Centro de notificaciones en tiempo real via WebSocket |
| **Dark Mode** | 3 modos (claro, oscuro, sistema) con persistencia |
| **PWA** | Instalable desde el navegador |

---

## Stack Tecnologico

### Frontend
- **React 18** + TypeScript + Vite 5
- **Tailwind CSS** + shadcn/ui (componentes accesibles)
- **Zustand** (estado global, 2KB) + **React Query v5** (cache API)
- **React Router v6** + **Zod** (validacion)
- **Socket.io-client** (tiempo real) + **Framer Motion** (animaciones)

### Backend
- **Node.js 20** + Express + TypeScript
- **Prisma 5** (ORM type-safe) + **PostgreSQL 15**
- **Socket.io** (WebSocket con rooms por hogar)
- **JWT** (access token 15min + refresh token 7d con rotacion)
- **Zod** (validacion de requests) + **Helmet** (seguridad HTTP)

### Infraestructura
- **pnpm** + **Turborepo** (monorepo con 3 paquetes)
- **Docker** multi-stage builds (desarrollo + produccion)
- **Redis 7** (cache y colas de notificaciones)
- **GitHub Actions** (CI: lint, type-check, build)
- **Easypanel** + **Traefik** (deploy en VPS con SSL automatico)

---

## Despliegue en Produccion

### Arquitectura

```
                    ┌─────────────────────────────────────────┐
                    │           VPS + EASYPANEL                │
                    │                                          │
                    │  ┌──────────┐  Traefik  ┌────────────┐  │
  Internet ────────▶│  │  Client  │ (reverse  │   Server   │  │
                    │  │ (Nginx)  │  proxy +  │ (Express)  │  │
                    │  │  :443    │   SSL)    │   :3000    │  │
                    │  └──────────┘           └─────┬──────┘  │
                    │                               │          │
                    │                 ┌─────────────┼───────┐  │
                    │                 ▼             ▼       │  │
                    │          ┌──────────┐  ┌──────────┐   │  │
                    │          │ Postgres │  │  Redis   │   │  │
                    │          │   :5432  │  │  :6379   │   │  │
                    │          └──────────┘  └──────────┘   │  │
                    │                                          │
                    └─────────────────────────────────────────┘
```

### Como se desplego

1. **VPS** con Ubuntu y Easypanel como panel de gestion de servicios
2. **4 servicios independientes** creados en Easypanel (no Docker Compose):
   - **PostgreSQL 15** — Base de datos relacional
   - **Redis 7** — Cache y sistema de colas para notificaciones
   - **Server** — Backend Node.js construido con Docker multi-stage desde `packages/server/Dockerfile`
   - **Client** — Frontend React construido con Docker multi-stage, servido por Nginx desde `packages/client/Dockerfile`
3. **Docker multi-stage builds** (3 etapas: deps → builder → runner) para imagenes optimizadas
4. **Traefik** como reverse proxy con certificados SSL automaticos via Let's Encrypt
5. **Subdominios** configurados con registros DNS tipo A apuntando al VPS
6. **Migraciones** ejecutadas manualmente en la terminal del contenedor server (`prisma migrate deploy`)
7. **Auto-deploy** activado: cada push a `main` reconstruye y despliega automaticamente

Ver [docs/DEPLOY.md](docs/DEPLOY.md) para la guia paso a paso completa.

---

## Instalacion Local

### Requisitos Previos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** y Docker Compose (para PostgreSQL y Redis)

### Inicio Rapido

```bash
# 1. Clonar el repositorio
git clone https://github.com/Joselumanfer10/conviviapp-2.0.git
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
│   ├── PRESENTACION.html   # Slides de presentacion del TFM
│   ├── TASKS.md            # Plan de desarrollo por fases
│   ├── CONTRATO_TECNICO.md # Especificacion tecnica
│   ├── MEMORIA_PROYECTO.md # Especificacion funcional
│   └── DEPLOY.md           # Guia de despliegue
│
├── docker-compose.yml       # Produccion
├── docker-compose.override.yml  # Desarrollo (auto-aplicado)
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml      # Monorepo workspaces
```

---

## API REST

Todos los endpoints bajo `/api`. Formato de respuesta estandarizado:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

### Endpoints Principales

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesion |
| POST | `/api/auth/refresh` | Refrescar access token |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/homes` | Crear hogar |
| POST | `/api/homes/:id/join` | Unirse con codigo |
| GET | `/api/homes/:id/expenses` | Gastos del hogar |
| GET | `/api/homes/:id/balances` | Balances entre miembros |
| GET | `/api/homes/:id/tasks` | Tareas del hogar |
| GET | `/api/homes/:id/shopping` | Lista de compras |
| GET | `/api/homes/:id/announcements` | Tablon de anuncios |
| GET | `/api/homes/:id/calendar` | Eventos del calendario |

Ver [docs/CONTRATO_TECNICO.md](docs/CONTRATO_TECNICO.md) para la lista completa de 40+ endpoints.

---

## Documentacion

| Documento | Contenido |
|-----------|-----------|
| [PRESENTACION.html](docs/PRESENTACION.html) | Slides de presentacion del TFM |
| [MEMORIA_PROYECTO.md](docs/MEMORIA_PROYECTO.md) | Vision, modulos, modelo de datos, algoritmos |
| [CONTRATO_TECNICO.md](docs/CONTRATO_TECNICO.md) | Stack, arquitectura, convenciones, API |
| [DEPLOY.md](docs/DEPLOY.md) | Guia de despliegue con Docker y Easypanel |
| [TASKS.md](docs/TASKS.md) | Plan de desarrollo con estado de cada tarea |

---

## Git - Flujo de Trabajo

```bash
# 1. Crear feature branch desde staging
git checkout staging && git pull && git checkout -b feature/nombre

# 2. Desarrollar y commit
git add . && git commit -m "tipo: descripcion"

# 3. Merge a staging
git checkout staging && git merge feature/nombre

# 4. Cuando este validado, merge a main (despliega automaticamente)
git checkout main && git merge staging
```

Formato de commits: `tipo: descripcion en imperativo` (espanol, ~50 chars)
- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Licencia

Este proyecto esta bajo la licencia [MIT](LICENSE).

---

> **Autor:** Jose Luis Manzanares Fernandez
> **Proyecto TFM** — Master en Desarrollo con IA — Big School (Director: Brais Mouredev)
> **Fecha:** Febrero 2026

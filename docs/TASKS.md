# Plan de Desarrollo - ConviviApp 2.0

## Resumen del MVP

**Problema a resolver**: Fricciones economicas, organizativas y comunicativas en pisos compartidos
**Usuario objetivo**: Estudiantes y jovenes profesionales (18-35) en pisos compartidos
**Accion principal**: Gestionar gastos compartidos con simplificacion de deudas
**Acciones secundarias**:
- Gestionar tareas domesticas con rotacion y karma
- Lista de compras compartida con conversion a gasto
- Tablon de anuncios, encuestas y votaciones
- Calendario compartido y reserva de espacios
- Reglas del hogar con aceptacion
- Centro de notificaciones en tiempo real
- Reportes mensuales con graficos
**Fuera de alcance v2.0**: Integracion Bizum, multi-idioma, app nativa movil

## Estado Actual
- [x] Fase 0: Preparacion
- [x] Fase 1: Backend
- [x] Fase 2: Frontend
- [ ] Fase 3: Testing
- [ ] Fase 4: Deploy

---

## Fase 0: Preparacion
Objetivo: Estructura del monorepo, configuracion, plan completo

### Tareas:
- [x] 0.1 Crear repositorio con estructura de carpetas
- [x] 0.2 Configurar monorepo (pnpm + Turborepo)
- [x] 0.3 Configurar TypeScript, ESLint, Prettier
- [x] 0.4 Crear docs/TASKS.md con plan completo
- [x] 0.5 Crear .env.example con variables documentadas
- [x] 0.6 Crear Docker configs (dev + prod + test)
- [x] 0.7 Crear CLAUDE.md del proyecto
- [x] 0.8 Configurar husky + lint-staged
- [x] 0.9 Crear package shared con tipos, validadores y utils
- [x] 0.10 Crear README.md del proyecto
- [x] 0.11 Crear .github/workflows/ci.yml (lint, type-check, build)

### Criterio de completado:
- [x] pnpm install funciona sin errores
- [x] Estructura de carpetas completa
- [x] Docker Compose levanta infraestructura (PostgreSQL + Redis)

---

## Fase 1: Backend
Objetivo: API REST completa, funcional y probada sin interfaz visual

### 1A - Infraestructura Base
- [x] 1.1 Configurar Express + middlewares (helmet, cors, morgan, cookie-parser)
- [x] 1.2 Configurar Prisma con schema completo y migracion inicial
- [x] 1.3 Implementar middleware de errores centralizado
- [x] 1.4 Implementar middleware de validacion con Zod
- [x] 1.5 Configurar health check endpoint

### 1B - Autenticacion
- [x] 1.6 Implementar registro de usuario con bcrypt
- [x] 1.7 Implementar login con JWT (access + refresh tokens)
- [x] 1.8 Implementar refresh token con httpOnly cookies
- [x] 1.9 Implementar logout con revocacion de tokens
- [x] 1.10 Implementar middleware authenticate
- [x] 1.11 Implementar endpoint GET /api/auth/me

### 1C - Hogares
- [x] 1.12 CRUD de hogares (crear, listar, detalle, actualizar, eliminar)
- [x] 1.13 Sistema de invitacion por codigo
- [x] 1.14 Unirse/salir de hogar
- [x] 1.15 Listar miembros del hogar
- [x] 1.16 Middleware requireHomeMember

### 1D - Gastos y Liquidaciones
- [x] 1.17 CRUD de gastos con division (equal, percentage, fixed, by_room)
- [x] 1.18 Calculo de balances por hogar
- [x] 1.19 Algoritmo de simplificacion de deudas
- [x] 1.20 CRUD de liquidaciones (crear, confirmar, rechazar, cancelar)
- [x] 1.21 Categorias de gastos por hogar

### 1E - Tareas
- [x] 1.22 CRUD de tareas con frecuencia configurable
- [x] 1.23 Asignacion de tareas con rotacion automatica
- [x] 1.24 Marcar tarea completada con sistema de karma
- [x] 1.25 Listar asignaciones del usuario

### 1F - Compras
- [x] 1.26 CRUD de items de compra
- [x] 1.27 Marcar como comprado con conversion automatica a gasto

### 1G - Modulos Secundarios
- [x] 1.28 Anuncios, encuestas y votaciones (CRUD + votar)
- [x] 1.29 Calendario compartido (CRUD eventos)
- [x] 1.30 Espacios compartidos y reservas (CRUD)
- [x] 1.31 Reglas del hogar con aceptacion (CRUD)
- [x] 1.32 Notificaciones (CRUD + marcar leida)
- [x] 1.33 Reportes mensuales (generacion de datos)

### 1H - Real-time
- [x] 1.34 Configurar Socket.io con autenticacion JWT
- [x] 1.35 Implementar event bus para emision de eventos
- [x] 1.36 Rooms por hogar con join/leave automatico

### Criterio de completado:
- [x] Todos los endpoints responden correctamente con curl
- [x] Validaciones Zod en todas las rutas
- [x] Errores manejados con codigos HTTP correctos
- [x] Socket.io emite eventos en operaciones CRUD

---

## Fase 2: Frontend
Objetivo: Interfaz conectada al backend funcional

### 2A - Infraestructura Base
- [x] 2.1 Configurar Vite + React + Tailwind + shadcn/ui
- [x] 2.2 Configurar React Router con rutas protegidas
- [x] 2.3 Configurar Axios con interceptors (auth, refresh token)
- [x] 2.4 Configurar React Query (QueryClientProvider)
- [x] 2.5 Configurar Zustand stores (auth, home, theme)
- [x] 2.6 Layout principal (Header, Sidebar, contenido)

### 2B - Autenticacion
- [x] 2.7 Pagina de Login con formulario validado
- [x] 2.8 Pagina de Registro con formulario validado
- [x] 2.9 Flujo de refresh token automatico
- [x] 2.10 Proteccion de rutas (redirect a login)

### 2C - Hogares
- [x] 2.11 Dashboard principal (lista de hogares)
- [x] 2.12 Crear hogar
- [x] 2.13 Unirse a hogar con codigo
- [x] 2.14 Dashboard del hogar con KPIs
- [x] 2.15 Configuracion del hogar y miembros

### 2D - Gastos
- [x] 2.16 Lista de gastos con filtros
- [x] 2.17 Formulario crear/editar gasto
- [x] 2.18 Vista de balances y deudas simplificadas
- [x] 2.19 Flujo de liquidaciones

### 2E - Tareas
- [x] 2.20 Lista de tareas con estados
- [x] 2.21 Formulario crear tarea
- [x] 2.22 Vista de asignaciones con marcar completada
- [x] 2.23 Ranking de karma

### 2F - Compras
- [x] 2.24 Lista de compras compartida
- [x] 2.25 Marcar como comprado (con precio)

### 2G - Modulos Secundarios
- [x] 2.26 Pagina de anuncios y votaciones
- [x] 2.27 Pagina de calendario
- [x] 2.28 Pagina de reservas de espacios
- [x] 2.29 Pagina de reglas del hogar
- [x] 2.30 Centro de notificaciones
- [x] 2.31 Pagina de reportes con graficos

### 2H - UX/UI Polish
- [x] 2.32 Dark mode con toggle y persistencia
- [x] 2.33 Animaciones con Framer Motion
- [x] 2.34 Toast notifications (sonner)
- [x] 2.35 Estados de carga (skeletons/spinners)
- [x] 2.36 Manejo de errores en UI
- [x] 2.37 PWA (manifest, service worker, iconos)
- [x] 2.38 Responsive design (mobile-first)

### 2I - Real-time Frontend
- [x] 2.39 Conectar Socket.io client
- [x] 2.40 Invalidacion de queries en tiempo real
- [x] 2.41 Toast de eventos en vivo
- [x] 2.42 Indicador de conexion

### Criterio de completado:
- [x] Flujo completo funciona: registro -> crear hogar -> usar features
- [x] Todos los formularios validan y muestran errores
- [x] Estados de carga y error manejados
- [x] Real-time actualiza la UI sin refresh

---

## Fase 3: Testing
Objetivo: Verificar funcionalidad y seguridad

### 3A - Tests Backend
- [x] 3.1 Tests de integracion: Auth (register, login, refresh, logout)
- [x] 3.2 Tests de integracion: Homes (CRUD, join, leave, members)
- [x] 3.3 Tests de integracion: Expenses (CRUD, balances, settlements)
- [x] 3.4 Tests de integracion: Tasks (CRUD, assignments, karma)
- [x] 3.5 Tests de integracion: Shopping (CRUD, buy, auto-expense)
- [x] 3.6 Tests de integracion: Announcements (CRUD, voting)
- [x] 3.7 Tests de integracion: Calendar, Reservations, Rules
- [x] 3.8 Tests de integracion: Notifications, Reports
- [x] 3.9 Tests unitarios: simplifyDebts algorithm
- [ ] 3.10 Tests unitarios: split functions

### 3B - Tests Frontend
- [x] 3.11 Tests unitarios: Zustand stores
- [x] 3.12 Tests unitarios: utility functions
- [ ] 3.13 Tests de componentes: formularios principales
- [ ] 3.14 Tests de integracion: flujo auth completo

### 3C - Seguridad
- [ ] 3.15 Auditoria de dependencias (npm audit)
- [x] 3.16 Verificar: sin secrets en codigo
- [x] 3.17 Verificar: validacion Zod en todos los endpoints
- [x] 3.18 Verificar: SQL injection prevenido (Prisma)
- [x] 3.19 Verificar: XSS prevenido (React + sanitizacion)
- [x] 3.20 Verificar: CORS configurado correctamente
- [x] 3.21 Verificar: rate limiting en auth
- [x] 3.22 Verificar: headers de seguridad (helmet)
- [x] 3.23 Verificar: passwords hasheados (bcrypt >= 10)

### Criterio de completado:
- [ ] Cobertura backend >= 70%
- [ ] Cobertura frontend >= 70%
- [ ] 0 vulnerabilidades criticas en audit
- [ ] Checklist de seguridad completo

---

## Fase 4: Deploy
Objetivo: Aplicacion funcionando en VPS con Easypanel

### Tareas:
- [x] 4.1 Dockerfiles de produccion optimizados (multi-stage)
- [x] 4.2 docker-compose.yml de produccion
- [x] 4.3 Nginx config para frontend (SPA + proxy API)
- [x] 4.4 Script de entrada para inyeccion de env en runtime
- [ ] 4.5 Configurar Easypanel: PostgreSQL + Redis
- [ ] 4.6 Configurar Easypanel: Backend service
- [ ] 4.7 Configurar Easypanel: Frontend service
- [ ] 4.8 Ejecutar migraciones en produccion
- [ ] 4.9 Configurar SSL/HTTPS automatico
- [ ] 4.10 Configurar auto-deploy desde GitHub (rama main)
- [ ] 4.11 Verificar flujo completo en produccion
- [x] 4.12 Crear docs/DEPLOY.md con guia paso a paso

### Criterio de completado:
- [ ] URL publica funcional con HTTPS
- [ ] Auto-deploy en push a main
- [ ] Flujo completo funciona en produccion
- [ ] Health checks pasando

---

## Notas y Decisiones
- Stack: React 18 + Vite | Node.js 20 + Express + Prisma | PostgreSQL + Redis
- Monorepo: pnpm + Turborepo
- Auth: JWT (access 15min + refresh 7d httpOnly cookie)
- Validacion: Zod en frontend y backend (shared)
- Real-time: Socket.io con rooms por hogar
- Deploy: Docker multi-stage + Easypanel en VPS
- UI: Tailwind CSS + shadcn/ui + Framer Motion
- Estado: Zustand (global) + React Query (server state)
- CI: GitHub Actions (lint + type-check + build) en PRs a staging/main

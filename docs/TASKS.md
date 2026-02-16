# Plan de Desarrollo - ConviviApp 2.0

## Resumen del MVP

**Problema a resolver**: Fricciones económicas, organizativas y comunicativas en pisos compartidos
**Usuario objetivo**: Estudiantes y jóvenes profesionales (18-35) en pisos compartidos
**Acción principal**: Gestionar gastos compartidos con simplificación de deudas
**Acciones secundarias**:
- Gestionar tareas domésticas con rotación y karma
- Lista de compras compartida con conversión a gasto
- Tablón de anuncios, encuestas y votaciones
- Calendario compartido y reserva de espacios
- Reglas del hogar con aceptación
- Centro de notificaciones en tiempo real
- Reportes mensuales con gráficos
**Fuera de alcance v2.0**: Integración Bizum, multi-idioma, app nativa móvil

## Estado Actual
- [x] Fase 0: Preparación
- [ ] Fase 1: Backend
- [ ] Fase 2: Frontend
- [ ] Fase 3: Testing
- [ ] Fase 4: Deploy

---

## Fase 0: Preparación
Objetivo: Estructura del monorepo, configuración, plan completo

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

### Criterio de completado:
- [x] pnpm install funciona sin errores
- [x] Estructura de carpetas completa
- [x] Docker Compose levanta infraestructura (PostgreSQL + Redis)

---

## Fase 1: Backend
Objetivo: API REST completa, funcional y probada sin interfaz visual

### 1A - Infraestructura Base
- [ ] 1.1 Configurar Express + middlewares (helmet, cors, morgan, cookie-parser)
- [ ] 1.2 Configurar Prisma con schema completo y migración inicial
- [ ] 1.3 Implementar middleware de errores centralizado
- [ ] 1.4 Implementar middleware de validación con Zod
- [ ] 1.5 Configurar health check endpoint

### 1B - Autenticación
- [ ] 1.6 Implementar registro de usuario con bcrypt
- [ ] 1.7 Implementar login con JWT (access + refresh tokens)
- [ ] 1.8 Implementar refresh token con httpOnly cookies
- [ ] 1.9 Implementar logout con revocación de tokens
- [ ] 1.10 Implementar middleware authenticate
- [ ] 1.11 Implementar endpoint GET /api/auth/me

### 1C - Hogares
- [ ] 1.12 CRUD de hogares (crear, listar, detalle, actualizar, eliminar)
- [ ] 1.13 Sistema de invitación por código
- [ ] 1.14 Unirse/salir de hogar
- [ ] 1.15 Listar miembros del hogar
- [ ] 1.16 Middleware requireHomeMember

### 1D - Gastos y Liquidaciones
- [ ] 1.17 CRUD de gastos con división (equal, percentage, fixed, by_room)
- [ ] 1.18 Cálculo de balances por hogar
- [ ] 1.19 Algoritmo de simplificación de deudas
- [ ] 1.20 CRUD de liquidaciones (crear, confirmar, rechazar, cancelar)
- [ ] 1.21 Categorías de gastos por hogar

### 1E - Tareas
- [ ] 1.22 CRUD de tareas con frecuencia configurable
- [ ] 1.23 Asignación de tareas con rotación automática
- [ ] 1.24 Marcar tarea completada con sistema de karma
- [ ] 1.25 Listar asignaciones del usuario

### 1F - Compras
- [ ] 1.26 CRUD de items de compra
- [ ] 1.27 Marcar como comprado con conversión automática a gasto

### 1G - Módulos Secundarios
- [ ] 1.28 Anuncios, encuestas y votaciones (CRUD + votar)
- [ ] 1.29 Calendario compartido (CRUD eventos)
- [ ] 1.30 Espacios compartidos y reservas (CRUD)
- [ ] 1.31 Reglas del hogar con aceptación (CRUD)
- [ ] 1.32 Notificaciones (CRUD + marcar leída)
- [ ] 1.33 Reportes mensuales (generación de datos)

### 1H - Real-time
- [ ] 1.34 Configurar Socket.io con autenticación JWT
- [ ] 1.35 Implementar event bus para emisión de eventos
- [ ] 1.36 Rooms por hogar con join/leave automático

### Criterio de completado:
- [ ] Todos los endpoints responden correctamente con curl
- [ ] Validaciones Zod en todas las rutas
- [ ] Errores manejados con códigos HTTP correctos
- [ ] Socket.io emite eventos en operaciones CRUD

---

## Fase 2: Frontend
Objetivo: Interfaz conectada al backend funcional

### 2A - Infraestructura Base
- [ ] 2.1 Configurar Vite + React + Tailwind + shadcn/ui
- [ ] 2.2 Configurar React Router con rutas protegidas
- [ ] 2.3 Configurar Axios con interceptors (auth, refresh token)
- [ ] 2.4 Configurar React Query (QueryClientProvider)
- [ ] 2.5 Configurar Zustand stores (auth, home, theme)
- [ ] 2.6 Layout principal (Header, Sidebar, contenido)

### 2B - Autenticación
- [ ] 2.7 Página de Login con formulario validado
- [ ] 2.8 Página de Registro con formulario validado
- [ ] 2.9 Flujo de refresh token automático
- [ ] 2.10 Protección de rutas (redirect a login)

### 2C - Hogares
- [ ] 2.11 Dashboard principal (lista de hogares)
- [ ] 2.12 Crear hogar
- [ ] 2.13 Unirse a hogar con código
- [ ] 2.14 Dashboard del hogar con KPIs
- [ ] 2.15 Configuración del hogar y miembros

### 2D - Gastos
- [ ] 2.16 Lista de gastos con filtros
- [ ] 2.17 Formulario crear/editar gasto
- [ ] 2.18 Vista de balances y deudas simplificadas
- [ ] 2.19 Flujo de liquidaciones

### 2E - Tareas
- [ ] 2.20 Lista de tareas con estados
- [ ] 2.21 Formulario crear tarea
- [ ] 2.22 Vista de asignaciones con marcar completada
- [ ] 2.23 Ranking de karma

### 2F - Compras
- [ ] 2.24 Lista de compras compartida
- [ ] 2.25 Marcar como comprado (con precio)

### 2G - Módulos Secundarios
- [ ] 2.26 Página de anuncios y votaciones
- [ ] 2.27 Página de calendario
- [ ] 2.28 Página de reservas de espacios
- [ ] 2.29 Página de reglas del hogar
- [ ] 2.30 Centro de notificaciones
- [ ] 2.31 Página de reportes con gráficos

### 2H - UX/UI Polish
- [ ] 2.32 Dark mode con toggle y persistencia
- [ ] 2.33 Animaciones con Framer Motion
- [ ] 2.34 Toast notifications (sonner)
- [ ] 2.35 Estados de carga (skeletons/spinners)
- [ ] 2.36 Manejo de errores en UI
- [ ] 2.37 PWA (manifest, service worker, iconos)
- [ ] 2.38 Responsive design (mobile-first)

### 2I - Real-time Frontend
- [ ] 2.39 Conectar Socket.io client
- [ ] 2.40 Invalidación de queries en tiempo real
- [ ] 2.41 Toast de eventos en vivo
- [ ] 2.42 Indicador de conexión

### Criterio de completado:
- [ ] Flujo completo funciona: registro -> crear hogar -> usar features
- [ ] Todos los formularios validan y muestran errores
- [ ] Estados de carga y error manejados
- [ ] Real-time actualiza la UI sin refresh

---

## Fase 3: Testing
Objetivo: Verificar funcionalidad y seguridad

### 3A - Tests Backend
- [ ] 3.1 Tests de integración: Auth (register, login, refresh, logout)
- [ ] 3.2 Tests de integración: Homes (CRUD, join, leave, members)
- [ ] 3.3 Tests de integración: Expenses (CRUD, balances, settlements)
- [ ] 3.4 Tests de integración: Tasks (CRUD, assignments, karma)
- [ ] 3.5 Tests de integración: Shopping (CRUD, buy, auto-expense)
- [ ] 3.6 Tests de integración: Announcements (CRUD, voting)
- [ ] 3.7 Tests de integración: Calendar, Reservations, Rules
- [ ] 3.8 Tests de integración: Notifications, Reports
- [ ] 3.9 Tests unitarios: simplifyDebts algorithm
- [ ] 3.10 Tests unitarios: split functions

### 3B - Tests Frontend
- [ ] 3.11 Tests unitarios: Zustand stores
- [ ] 3.12 Tests unitarios: utility functions
- [ ] 3.13 Tests de componentes: formularios principales
- [ ] 3.14 Tests de integración: flujo auth completo

### 3C - Seguridad
- [ ] 3.15 Auditoría de dependencias (npm audit)
- [ ] 3.16 Verificar: sin secrets en código
- [ ] 3.17 Verificar: validación Zod en todos los endpoints
- [ ] 3.18 Verificar: SQL injection prevenido (Prisma)
- [ ] 3.19 Verificar: XSS prevenido (React + sanitización)
- [ ] 3.20 Verificar: CORS configurado correctamente
- [ ] 3.21 Verificar: rate limiting en auth
- [ ] 3.22 Verificar: headers de seguridad (helmet)
- [ ] 3.23 Verificar: passwords hasheados (bcrypt >= 10)

### Criterio de completado:
- [ ] Cobertura backend >= 70%
- [ ] Cobertura frontend >= 70%
- [ ] 0 vulnerabilidades críticas en audit
- [ ] Checklist de seguridad completo

---

## Fase 4: Deploy
Objetivo: Aplicación funcionando en VPS con Easypanel

### Tareas:
- [ ] 4.1 Dockerfiles de producción optimizados (multi-stage)
- [ ] 4.2 docker-compose.yml de producción
- [ ] 4.3 Nginx config para frontend (SPA + proxy API)
- [ ] 4.4 Script de entrada para inyección de env en runtime
- [ ] 4.5 Configurar Easypanel: PostgreSQL + Redis
- [ ] 4.6 Configurar Easypanel: Backend service
- [ ] 4.7 Configurar Easypanel: Frontend service
- [ ] 4.8 Ejecutar migraciones en producción
- [ ] 4.9 Configurar SSL/HTTPS automático
- [ ] 4.10 Configurar auto-deploy desde GitHub (rama main)
- [ ] 4.11 Verificar flujo completo en producción
- [ ] 4.12 Crear docs/DEPLOY.md con guía paso a paso

### Criterio de completado:
- [ ] URL pública funcional con HTTPS
- [ ] Auto-deploy en push a main
- [ ] Flujo completo funciona en producción
- [ ] Health checks pasando

---

## Notas y Decisiones
- Stack: React 18 + Vite | Node.js 20 + Express + Prisma | PostgreSQL + Redis
- Monorepo: pnpm + Turborepo
- Auth: JWT (access 15min + refresh 7d httpOnly cookie)
- Validación: Zod en frontend y backend (shared)
- Real-time: Socket.io con rooms por hogar
- Deploy: Docker multi-stage + Easypanel en VPS
- UI: Tailwind CSS + shadcn/ui + Framer Motion
- Estado: Zustand (global) + React Query (server state)

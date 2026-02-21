# Guía de Despliegue - ConviviApp

## Contenido

1. [Desarrollo Local con Docker](#desarrollo-local-con-docker)
2. [Despliegue en VPS con Easypanel](#despliegue-en-vps-con-easypanel)
3. [Variables de Entorno](#variables-de-entorno)
4. [Troubleshooting](#troubleshooting)

---

## Desarrollo Local con Docker

### Requisitos

- Docker Desktop 4.x+
- Docker Compose v2+
- (Opcional) Make

### Inicio Rápido

```bash
# 1. Clonar y entrar al proyecto
git clone <repo-url>
cd conviviapp

# 2. Copiar archivos de entorno
cp .env.example .env

# 3. Iniciar todos los servicios
docker compose up -d

# 4. Ver logs
docker compose logs -f
```

### Servicios Disponibles (Desarrollo)

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | React + Vite (HMR) |
| Backend | http://localhost:3000 | Express API |
| Adminer | http://localhost:8080 | UI de base de datos |
| PostgreSQL | localhost:5432 | Base de datos |
| Redis | localhost:6379 | Caché |

### Comandos Útiles

```bash
# Con Make (recomendado)
make help           # Ver todos los comandos
make docker-up      # Iniciar servicios
make docker-down    # Detener servicios
make docker-logs    # Ver logs
make db-migrate     # Ejecutar migraciones
make db-studio      # Abrir Prisma Studio

# Con Docker Compose directamente
docker compose up -d              # Iniciar
docker compose down               # Detener
docker compose logs -f server     # Logs del backend
docker compose exec server sh     # Shell en el contenedor
```

### Solo Infraestructura

Si prefieres ejecutar el código fuera de Docker pero usar PostgreSQL y Redis en contenedores:

```bash
# Iniciar solo DB y Redis
make infra-up

# En otra terminal, iniciar desarrollo
pnpm dev
```

---

## Despliegue en VPS con Easypanel

### Requisitos Previos

1. VPS con Easypanel instalado
2. Dominio configurado (DNS apuntando al VPS)
3. Repositorio en GitHub

### Paso 1: Conectar GitHub a Easypanel

1. En Easypanel, ve a **Settings > Git**
2. Conecta tu cuenta de GitHub
3. Autoriza acceso al repositorio `conviviapp`

### Paso 2: Crear Proyecto en Easypanel

1. Crea un nuevo proyecto: `conviviapp`
2. Añade los siguientes servicios:

#### 2.1 PostgreSQL

```
Tipo: Postgres
Nombre: conviviapp-db
Versión: 15
Variables:
  - POSTGRES_USER: conviviapp
  - POSTGRES_PASSWORD: [genera_password_seguro]
  - POSTGRES_DB: conviviapp
```

#### 2.2 Redis

```
Tipo: Redis
Nombre: conviviapp-redis
Versión: 7
```

#### 2.3 Backend (App Service)

```
Tipo: App
Nombre: conviviapp-server
Fuente: GitHub
  - Repositorio: tu-usuario/conviviapp
  - Branch: main
  - Dockerfile: packages/server/Dockerfile
  - Context: .

Dominio: api.tudominio.com
Puerto: 3000

Variables de entorno:
  - NODE_ENV: production
  - PORT: 3000
  - DATABASE_URL: postgresql://conviviapp:[password]@conviviapp-db:5432/conviviapp
  - REDIS_URL: redis://conviviapp-redis:6379
  - JWT_SECRET: [genera_secreto_seguro]
  - JWT_REFRESH_SECRET: [genera_otro_secreto]
  - CORS_ORIGIN: https://tudominio.com
```

#### 2.4 Frontend (App Service)

```
Tipo: App
Nombre: conviviapp-client
Fuente: GitHub
  - Repositorio: tu-usuario/conviviapp
  - Branch: main
  - Dockerfile: packages/client/Dockerfile
  - Context: .

Dominio: tudominio.com (o app.tudominio.com)
Puerto: 80

Build Args:
  - VITE_API_URL: https://api.tudominio.com
```

### Paso 3: Configurar Despliegue Automático

En cada servicio de Easypanel:

1. Ve a **Settings > Deployment**
2. Activa **Auto Deploy**
3. Selecciona la rama `main`

Ahora cada push a `main` desplegará automáticamente.

### Paso 4: Ejecutar Migraciones

Después del primer despliegue:

1. Ve al servicio `conviviapp-server`
2. Abre la terminal (Shell)
3. Ejecuta:

```bash
npx prisma migrate deploy
```

### Paso 5: Configurar SSL

Easypanel configura Let's Encrypt automáticamente si:
- El dominio apunta correctamente al VPS
- Los puertos 80 y 443 están abiertos

---

## Variables de Entorno

### Producción (Mínimas Requeridas)

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `DATABASE_URL` | Server | URL de PostgreSQL |
| `REDIS_URL` | Server | URL de Redis |
| `JWT_SECRET` | Server | Secreto para tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Server | Secreto para refresh tokens |
| `CORS_ORIGIN` | Server | URL del frontend |
| `NODE_ENV` | Server | `production` |
| `VITE_API_URL` | Client | URL del backend API |

### Generar Secretos Seguros

```bash
# En Linux/Mac
openssl rand -base64 32

# O usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Arquitectura de Despliegue

```
                    ┌─────────────────────────────────────────┐
                    │              EASYPANEL                   │
                    │                                          │
┌──────────┐       │  ┌────────────┐    ┌────────────────┐   │
│  GitHub  │──────▶│  │   Client   │    │     Server     │   │
│   Push   │       │  │   (Nginx)  │───▶│   (Express)    │   │
└──────────┘       │  │  :443/80   │    │     :3000      │   │
                    │  └────────────┘    └───────┬────────┘   │
                    │                            │             │
                    │              ┌─────────────┼─────────┐   │
                    │              │             │         │   │
                    │              ▼             ▼         │   │
                    │       ┌──────────┐  ┌──────────┐    │   │
                    │       │ Postgres │  │  Redis   │    │   │
                    │       │   :5432  │  │  :6379   │    │   │
                    │       └──────────┘  └──────────┘    │   │
                    │                                          │
                    └─────────────────────────────────────────┘
```

---

## Troubleshooting

### El backend no conecta a la base de datos

1. Verifica que PostgreSQL esté corriendo
2. Comprueba `DATABASE_URL` en las variables de entorno
3. En Easypanel, usa el nombre del servicio como host (ej: `conviviapp-db`)

### CORS errors en producción

1. Verifica que `CORS_ORIGIN` incluya el dominio del frontend
2. Asegúrate de usar HTTPS en producción

### Las migraciones fallan

```bash
# Reset completo (¡BORRA DATOS!)
npx prisma migrate reset

# O solo deploy
npx prisma migrate deploy
```

### Los WebSockets no funcionan

1. Verifica que Nginx/proxy permita upgrade de conexiones
2. En Easypanel, asegúrate de que el puerto 3000 esté expuesto

### Logs útiles

```bash
# En Easypanel, ve a cada servicio > Logs
# O usa la terminal:
docker logs conviviapp-server -f
docker logs conviviapp-client -f
```

---

## Checklist de Despliegue

- [x] Secretos JWT generados y configurados
- [x] PostgreSQL funcionando
- [x] Redis funcionando
- [x] Migraciones ejecutadas
- [x] SSL/HTTPS configurado (Let's Encrypt)
- [x] CORS configurado correctamente
- [x] Variables de entorno verificadas
- [x] Auto-deploy activado
- [x] Dominio DNS configurado
- [x] Health checks pasando

---

## URLs de Produccion

| Servicio | URL |
|----------|-----|
| Frontend | https://conviviapp.joseluismanzanaresfernandez.es |
| Backend API | https://conviviapp-api.joseluismanzanaresfernandez.es |
| Health Check | https://conviviapp-api.joseluismanzanaresfernandez.es/health |

**Codigo de invitacion para pruebas:** `CNPMNMG8` (casa con datos de ejemplo)

---

> **Ultima actualizacion:** 2026-02-21

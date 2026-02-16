# ============================================
# ConviviApp Client - Dockerfile
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/client/package.json ./packages/client/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/client/node_modules ./packages/client/node_modules

# Copiar código fuente
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client
COPY package.json pnpm-workspace.yaml tsconfig.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build client
WORKDIR /app/packages/client

# Variables de entorno para build (se pueden sobrescribir)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# Stage 3: Runner con Nginx
FROM nginx:alpine AS runner

# Copiar configuración de nginx
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build estático
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Script para inyectar variables de entorno en runtime
COPY packages/client/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

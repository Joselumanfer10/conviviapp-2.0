# ============================================
# ConviviApp Server - Dockerfile
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules

# Copiar código fuente
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
COPY package.json pnpm-workspace.yaml tsconfig.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Generar Prisma Client y build server
WORKDIR /app/packages/server
RUN pnpm prisma:generate
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copiar solo lo necesario para producción
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@conviviapp/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@conviviapp/shared/

USER expressjs

EXPOSE 3000

# dumb-init previene problemas con señales en containers
CMD ["dumb-init", "node", "dist/app.js"]

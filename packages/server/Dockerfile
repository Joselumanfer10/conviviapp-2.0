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

# Copiar schema de Prisma antes del install (postinstall ejecuta prisma generate)
COPY packages/server/prisma ./packages/server/prisma

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
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Generar Prisma Client y build server
WORKDIR /app/packages/server
RUN pnpm prisma:generate
RUN pnpm build

# Crear paquete standalone con pnpm deploy (resuelve symlinks)
WORKDIR /app
RUN pnpm --filter @conviviapp/server deploy /app/deploy --prod

# Copiar dist y prisma al deploy (prisma client ya generado por postinstall del deploy)
RUN cp -r /app/packages/server/dist /app/deploy/dist
RUN cp -r /app/packages/server/prisma /app/deploy/prisma

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copiar paquete standalone completo
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/deploy/dist ./dist
COPY --from=builder /app/deploy/prisma ./prisma

USER expressjs

EXPOSE 3000

# dumb-init previene problemas con señales en containers
CMD ["dumb-init", "node", "dist/app.js"]

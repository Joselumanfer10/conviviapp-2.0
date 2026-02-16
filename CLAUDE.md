# CLAUDE.md - ConviviApp

## Proyecto
- **Stack:** React 18 + Vite (frontend) | Node.js + Express + Prisma (backend)
- **Monorepo:** pnpm + Turborepo
- **Docs:** Ver @docs/MEMORIA_PROYECTO.md y @docs/CONTRATO_TECNICO.md

## Comandos
```bash
pnpm install          # Instalar dependencias
pnpm dev              # Desarrollo (todos)
pnpm --filter client dev   # Solo frontend
pnpm --filter server dev   # Solo backend
pnpm test             # Tests
pnpm lint             # Linter
pnpm build            # Build producción
```

## Git - Flujo Individual

```bash
# 1. Crear feature branch
git checkout staging && git pull && git checkout -b feature/nombre

# 2. Desarrollar y commit
git add . && git commit -m "tipo: descripción"

# 3. Merge directo a staging (sin PR)
git checkout staging && git merge feature/nombre

# 4. Cuando esté validado, merge a main
git checkout main && git merge staging
```

Formato commits: `tipo: descripción en imperativo` (español, ~50 chars)
- feat, fix, docs, refactor, test, chore

## Convenciones
- TypeScript estricto
- PascalCase: componentes, tipos | camelCase: funciones, variables
- Validación con Zod en API boundaries
- No hardcodear URLs ni secrets

## Estructura
```
packages/
├── shared/   # Tipos y utils compartidos
├── client/   # Frontend React
└── server/   # Backend Express + Prisma
```

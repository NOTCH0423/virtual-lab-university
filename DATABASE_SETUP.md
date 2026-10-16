# Configuracion de Base de Datos (Supabase + Vercel)

## 1. Proyecto Supabase
- Proyecto: `virtual-lab` (region us-east-1). Si esta pausado, reanudalo en el dashboard de Supabase.
- Project Settings > Database > Connection string:
  - **Transaction pooler (6543)** -> `DATABASE_URL` (agrega `?pgbouncer=true&connection_limit=1`)
  - **Session pooler / Direct (5432)** -> `DIRECT_URL`

## 2. Variables en Vercel (Production y Preview)
| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL pooler 6543 |
| `DIRECT_URL` | URL 5432 |
| `NEXTAUTH_URL` | `https://virtual-lab-university.vercel.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GITHUB_ID` / `GITHUB_SECRET` | opcional |

Elimina las variables antiguas de Neon (`DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`) y desconecta la integracion Neon si ya no se usa.

## 3. Crear tablas y superadmin (desde tu PC, con `.env` apuntando a Supabase)
```bash
npx prisma migrate dev --name init   # crea prisma/migrations y aplica
# en adelante, en produccion: npx prisma migrate deploy
SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... npx prisma db seed
```

## 4. Deploy
Haz push a `main` (Vercel despliega automaticamente) o `npx vercel --prod`.

## Troubleshooting
- `prepared statement already exists`: falta `?pgbouncer=true` en `DATABASE_URL`.
- Migraciones que se cuelgan: `DIRECT_URL` debe usar el puerto 5432.
- `Table does not exist`: ejecuta `npx prisma migrate deploy`.

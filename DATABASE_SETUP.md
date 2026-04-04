# 🌐 Configuración de Base de Datos en la Nube

## Opción 1: Neon (PostgreSQL) - RECOMENDADO

### Pasos:

1. **Crear cuenta en Neon**
   - Ve a https://neon.tech
   - Regístrate con GitHub (gratis)
   - Crea un nuevo proyecto

2. **Obtener connection string**
   - En el dashboard de Neon, ve a tu proyecto
   - Copia la connection string desde "Connection Details"
   - Se verá algo como:
     ```
     postgresql://usuario:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

3. **Configurar en Vercel**
   - Ve a https://vercel.com/dashboard
   - Selecciona tu proyecto "virtual-lab-university"
   - Ve a Settings > Environment Variables
   - Agrega:
     - `DATABASE_URL` = tu connection string de Neon

4. **Hacer deploy**
   ```bash
   npx vercel --prod
   ```

### Beneficios de Neon:
- ✅ Tier gratuito generoso (0.5 GB RAM, 0.5 CPU)
- ✅ Branching de base de datos (como Git)
- ✅ Conexión serverless optimizada
- ✅ Compatible 100% con Prisma

---

## Opción 2: Supabase (PostgreSQL)

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Ir a Settings > Database
4. Copiar "Connection string" (URI)
5. Agregar a Vercel como variable de entorno

---

## Opción 3: Railway (PostgreSQL)

1. Crear cuenta en https://railway.app
2. New Project > PostgreSQL
3. Esperar a que provisioning termine
4. Ir a Variables > copy raw value
5. Agregar a Vercel

---

## ⚠️ IMPORTANTE: Después de cambiar la base de datos

### 1. Actualizar Schema
```bash
npx prisma db push
```

### 2. Generar cliente
```bash
npx prisma generate
```

### 3. Hacer seed (crear datos iniciales)
```bash
npx prisma db seed
```

### 4. Hacer deploy
```bash
npx vercel --prod
```

---

## 🔧 Troubleshooting

### Error: "Prisma has detected that this project was built on Vercel"
Esto se resuelve automáticamente con el script `postinstall` en package.json.

### Error: "Connection refused"
- Verifica que la DATABASE_URL sea correcta
- Asegúrate de que el usuario tenga permisos
- Verifica el SSL mode (debe ser `require` o `prefer`)

### Error: "Table does not exist"
- Ejecuta `npx prisma db push` para crear las tablas
- O migra con `npx prisma migrate deploy`

---

## 📊 Verificar conexión

1. Ve a Settings > Environment Variables en Vercel
2. Confirma que DATABASE_URL está configurada
3. Revisa los logs de deployment para errores
4. Prueba la app en https://virtual-lab-university.vercel.app

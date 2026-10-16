/**
 * Borra todos los usuarios y crea un único SUPER_ADMIN.
 *
 * Uso:
 *   SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... SUPER_ADMIN_NAME=... npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/reset-superadmin.ts
 */
import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function validatePassword(password: string) {
  if (password.length < 12) {
    throw new Error('SUPER_ADMIN_PASSWORD debe tener al menos 12 caracteres');
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD debe incluir mayúscula, minúscula, número y carácter especial'
    );
  }
}

async function main() {
  const email = requireEnv('SUPER_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SUPER_ADMIN_PASSWORD');
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Super Admin';
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME?.trim() || name.split(' ')[0] || 'Super';
  const lastName =
    process.env.SUPER_ADMIN_LAST_NAME?.trim() ||
    name.split(' ').slice(1).join(' ') ||
    'Admin';

  validatePassword(password);

  console.log('🔐 Reset de seguridad: eliminando usuarios...');

  await prisma.$transaction([
    prisma.experimentResult.deleteMany(),
    prisma.experimentProgress.deleteMany(),
    prisma.userProgress.deleteMany(),
    prisma.userAchievement.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      university: 'Virtual Lab University',
      bio: 'Superusuario propietario del sistema',
      emailVerified: new Date(),
    },
  });

  await prisma.systemStats
    .upsert({
      where: { id: 'global-stats' },
      update: {
        totalUsers: 1,
        activeUsers: 1,
      },
      create: {
        id: 'global-stats',
        totalUsers: 1,
        activeUsers: 1,
        totalExperiments: 0,
        experimentsCompleted: 0,
        totalHours: 0,
        certificates: 0,
      },
    })
    .catch(async () => {
      // Si el id no existe como unique en update path, recreamos
      await prisma.systemStats.deleteMany();
      await prisma.systemStats.create({
        data: {
          id: 'global-stats',
          totalUsers: 1,
          activeUsers: 1,
        },
      });
    });

  const fingerprint = createHash('sha256')
    .update(email + ':' + randomBytes(8).toString('hex'))
    .digest('hex')
    .slice(0, 12);

  console.log('✅ Usuarios eliminados');
  console.log('✅ Superusuario creado');
  console.log(`   id: ${user.id}`);
  console.log(`   email: ${user.email}`);
  console.log(`   role: ${user.role}`);
  console.log(`   fingerprint: ${fingerprint}`);
  console.log('⚠️  Guarda la contraseña en un lugar seguro. No se volverá a mostrar.');
}

main()
  .catch((error) => {
    console.error('❌ Error en reset:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

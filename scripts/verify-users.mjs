import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  select: { email: true, role: true, status: true, name: true },
});
console.log(JSON.stringify(users, null, 2));
console.log('count=' + users.length);
await prisma.$disconnect();

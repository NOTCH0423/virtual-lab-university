import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { ROLES, canAssignRole } from '@/lib/roles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const role = body.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.TEACHER;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    if (!canAssignRole(auth.user.role, role)) {
      return NextResponse.json(
        { message: 'Solo un superadministrador puede crear administradores' },
        { status: 403 }
      );
    }

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: 'Email inválido' }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ message: strength.message }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${role === ROLES.ADMIN ? 'Administrador' : 'Profesor'} creado exitosamente`,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

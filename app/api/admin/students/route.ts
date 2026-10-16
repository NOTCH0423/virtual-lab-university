import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { ROLES } from '@/lib/roles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const students = await prisma.user.findMany({
      where: { role: ROLES.STUDENT },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        university: true,
        career: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            progress: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const university = typeof body.university === 'string' ? body.university.trim() || null : null;
    const career = typeof body.career === 'string' ? body.career.trim() || null : null;

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

    const student = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        university,
        career,
        role: ROLES.STUDENT,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Estudiante creado exitosamente',
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
          role: student.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

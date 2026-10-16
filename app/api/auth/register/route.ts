import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { createUserSession } from '@/lib/session-token';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { ROLES } from '@/lib/roles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { message: 'Demasiados registros. Intenta más tarde.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const university =
      typeof body.university === 'string' ? body.university.trim() || null : null;
    const career = typeof body.career === 'string' ? body.career.trim() || null : null;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
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

    const user = await prisma.user.create({
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

    await prisma.systemStats
      .update({
        where: { id: 'global-stats' },
        data: {
          totalUsers: { increment: 1 },
          activeUsers: { increment: 1 },
        },
      })
      .catch(() => undefined);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyStats
      .upsert({
        where: { date: today },
        update: { newUsers: { increment: 1 } },
        create: {
          date: today,
          newUsers: 1,
        },
      })
      .catch(() => undefined);

    const session = await createUserSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

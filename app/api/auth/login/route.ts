import { NextResponse } from 'next/server';

// Endpoint antiguo reemplazado por /api/auth/token (sesión por pestaña con JWT firmado).
export async function POST() {
  return NextResponse.json({ message: 'Usa /api/auth/token' }, { status: 410 });
}

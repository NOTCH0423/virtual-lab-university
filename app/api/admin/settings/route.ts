import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const defaultSettings = {
  siteName: 'Virtual Lab University',
  siteUrl: 'https://virtuallab.edu',
  maintenance: false,
  registration: true,
  emailNotifications: true,
  darkMode: true,
  sessionTimeout: 60,
  twoFactorRequired: true,
  activityLogs: true,
  systemEmail: 'noreply@virtuallab.edu',
  senderName: 'Virtual Lab',
  welcomeEmail: true,
};

let systemSettings = { ...defaultSettings };

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    systemSettings = { ...systemSettings, ...body };

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración actualizada',
      settings: systemSettings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

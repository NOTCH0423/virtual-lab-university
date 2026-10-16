'use client';

import { AuthProvider } from '@/lib/client-auth';
import { ReactNode, useEffect } from 'react';
import { applyAppearance, loadPreferences } from '@/lib/preferences';

interface ProvidersProps {
  children: ReactNode;
}

function AppearanceApplier() {
  useEffect(() => {
    const apply = () => applyAppearance(loadPreferences().appearance);
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    window.addEventListener('storage', apply);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('storage', apply);
    };
  }, []);
  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AppearanceApplier />
      {children}
    </AuthProvider>
  );
}

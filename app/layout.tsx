import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Lab University - Laboratorio Virtual Interactivo',
  description: 'Plataforma de laboratorio virtual universitario con simulaciones 3D interactivas para física, química y biología.',
  keywords: ['laboratorio virtual', 'simulaciones 3D', 'educación universitaria', 'física', 'química', 'biología'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

'use client';

import dynamic from 'next/dynamic';

const Runner = dynamic(() => import('@/components/lab/ExperimentRunner'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function ExperimentPage({ slug }: { slug: string }) {
  return <Runner slug={slug} />;
}

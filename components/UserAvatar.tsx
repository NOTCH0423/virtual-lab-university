'use client';

export function initialsOf(name?: string | null) {
  return (name || 'U').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

export default function UserAvatar({
  src, name, className = 'w-8 h-8 text-sm', gradient = 'from-primary-400 to-secondary-400',
}: { src?: string | null; name?: string | null; className?: string; gradient?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || 'Avatar'} className={`${className} rounded-full object-cover shrink-0`} />;
  }
  return (
    <span className={`${className} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-medium shrink-0`}>
      {initialsOf(name)}
    </span>
  );
}

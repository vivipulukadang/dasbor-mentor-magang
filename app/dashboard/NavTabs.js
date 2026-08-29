'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Beranda' },
  { href: '/dashboard/peserta', label: 'Peserta' },
  { href: '/dashboard/kalender', label: 'Kalender' },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {items.map((it) => {
        const active = it.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(it.href);
        return (
          <Link key={it.href} className={`tab ${active ? 'active' : ''}`} href={it.href}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

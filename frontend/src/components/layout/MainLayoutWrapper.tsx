'use client';

import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className={`flex-grow ${!isHome ? 'pt-[72px]' : ''}`}>
      {children}
    </main>
  );
}

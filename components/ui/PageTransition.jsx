'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return (
    <div
      className={`transition-[opacity,filter] duration-700 ease-out ${
        visible ? 'opacity-100 blur-0' : 'opacity-0 blur-[4px]'
      }`}
    >
      {children}
    </div>
  );
}

'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <>
      {!isHomepage && <Navbar />}
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}

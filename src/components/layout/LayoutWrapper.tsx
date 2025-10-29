'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { LanguageProvider } from '@/lib/utils/language-context';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should NOT show Header/Footer (dashboard pages)
  const isDashboardPage = pathname?.startsWith('/admin') || 
                          pathname?.startsWith('/therapist') || 
                          pathname?.startsWith('/client') ||
                          pathname?.startsWith('/login') ||
                          pathname?.startsWith('/register');
  
  // Public pages show Header/Footer
  if (!isDashboardPage) {
    return (
      <LanguageProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </div>
      </LanguageProvider>
    );
  }
  
  // Dashboard pages show only content
  return <>{children}</>;
}

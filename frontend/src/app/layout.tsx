import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthSyncProvider from '@/components/providers/AuthSyncProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Novara - Modern Clothing Store',
  description: 'A premium eCommerce store for contemporary clothing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <AuthSyncProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from 'next';
import { Quicksand as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Negociator',
  description: 'Négocier ieux avec votre client',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <header className='sticky top-0 z-50 bg-primary shadow-sm'>
          <div className='container mx-auto py-4'>
            <h1 className='text-xl font-bold text-primary-foreground'>
              {metadata.title as string}
            </h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

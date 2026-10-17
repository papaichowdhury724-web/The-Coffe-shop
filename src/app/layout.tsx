import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { CafeProvider } from '@/context/CafeContext';

export const metadata: Metadata = {
  title: 'AURA NOIR • Artisanal Roastery & Velvet Coffee Sanctuary',
  description: 'An architectural sensory coffee experience. Single-origin micro-lots, precision manual extractions, velvet lounge reservations, and bespoke cupping.',
  keywords: ['luxury coffee', 'specialty coffee', 'table reservation', 'roastery', 'pour over', 'espresso atelier'],
  openGraph: {
    title: 'AURA NOIR • Artisanal Coffee Atelier',
    description: 'Cinematic 3D coffee experience and luxury velvet table reservations.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#0A0807] text-[#FDF8F0] antialiased overflow-x-hidden">
        <CafeProvider>
          {children}
        </CafeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://furnish-agent-room-planner.davidglasser2.chatgpt.site'),
  title: 'Furnish — Shared room planner',
  description: 'Plan a valid living room together with ChatGPT, preserve variants, and export the result.',
  openGraph: {
    title: 'Furnish — Shared room planner',
    description: 'Plan a room together with ChatGPT.',
    type: 'website',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Furnish shared room planner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furnish — Shared room planner',
    description: 'Plan a room together with ChatGPT.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}

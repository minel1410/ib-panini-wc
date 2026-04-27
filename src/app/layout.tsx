import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panini WC 2026',
  description: 'Sticker trading app',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

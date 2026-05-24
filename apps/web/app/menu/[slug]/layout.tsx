import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0C' },
  ],
};

export const metadata: Metadata = {
  title: 'Menu',
  description: 'View our digital menu',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Digital Menu',
    description: 'Scan the QR code to view our menu',
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

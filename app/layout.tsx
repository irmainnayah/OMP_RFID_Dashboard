import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from 'next/font/google';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  display: 'swap',
});

const plexSansCondensed = IBM_Plex_Sans_Condensed({
  variable: '--font-plex-sans-condensed',
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SMMS WORKSHOP SERVICE MONITORING DASHBOARD | OMP RFID',
  description:
    'Real-time workshop bay telemetry and service tracking for HD875 heavy equipment fleet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexSansCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
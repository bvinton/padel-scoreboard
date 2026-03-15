import type { Metadata, Viewport } from 'next';
import './globals.css';

// This tells iOS and Android to treat it like a full-screen app
export const metadata: Metadata = {
  title: 'Padel Scoreboard',
  description: 'Mobile-first live Padel scoreboard',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Padel Score',
  },
  formatDetection: {
    telephone: false, // Prevents padel scores from turning into phone number links
  },
};

// This tells mobile browsers to lock the zoom and use the dark background color
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Strictly prevents pinch-to-zoom when tapping quickly
  themeColor: '#0f172a', // Matches your slate-950 background
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased font-display">
        {children}
      </body>
    </html>
  );
}
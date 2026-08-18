import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesiDreams Social Automation Control Center',
  description: 'Automated Instagram & Social Media Content Pipeline for desidreams.fun',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

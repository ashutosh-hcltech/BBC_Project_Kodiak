// app/layout.jsx or app/layout.tsx
import './globals.css'; // This line is essential

import type { Metadata } from 'next'; // Keep this if using TypeScript
import { Inter } from 'next/font/google'; // Or whatever font you configured

const inter = Inter({ subsets: ['latin'] }); // Or your chosen font

export const metadata: Metadata = {
  title: 'AI Assessment Builder',
  description: 'AI Assessment Builder Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Make sure the Material Icons link is also here */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
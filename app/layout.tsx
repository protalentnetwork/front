import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backoffice",
  description: "1st backoffice version",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex h-screen bg-black text-gray-100 overflow-hidden">
          <div className='fixed inset-0 z-0'>
            <div className='absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-black opacity-80' />
            <div className='absolute inset-0 backdrop-blur-sm' />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}

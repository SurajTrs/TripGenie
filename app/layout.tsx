import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravixAI - AI-Powered Travel Booking",
  description: "Book flights, hotels, trains, and buses with AI assistance. Real-time pricing and instant booking.",
};

import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script data-noptimize="1" data-cfasync="false" data-wpfc-render="false" dangerouslySetInnerHTML={{__html: `(function () {var script = document.createElement("script");script.async = 1;script.src = 'https://emrldco.com/NDk2MTQ4.js?t=496148';document.head.appendChild(script);})();`}} />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        <Script
          id="travelpayouts-verify"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {var script = document.createElement("script");script.async = 1;script.src = 'https://emrldco.com/NDk2MTQ4.js?t=496148';document.head.appendChild(script);})();`,
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


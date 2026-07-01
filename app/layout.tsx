import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Header from "@layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://tenis-komedi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tenis Komedi - Serpong Lagoon",
  description: "Tenis Komedi adalah platform resmi untuk melihat ranking dan data pemain tenis komedi. Temukan statistik lengkap, profil pemain, dan hasil pertandingan terkini di sini.",
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
  openGraph: {
    title: "Tenis Komedi - Serpong Lagoon",
    description: "Tenis Komedi adalah platform resmi untuk melihat ranking dan data pemain tenis komedi. Temukan statistik lengkap, profil pemain, dan hasil pertandingan terkini di sini.",
    url: siteUrl,
    siteName: "Tenis Komedi",
    images: [
      {
        url: "/logo.webp",
        width: 512,
        height: 512,
        alt: "Tenis Komedi Lagoon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tenis Komedi - Serpong Lagoon",
    description: "Tenis Komedi adalah platform resmi untuk melihat ranking dan data pemain tenis komedi.",
    images: ["/logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">

        {/* ── Fixed background image ── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -2,
            backgroundImage: "url('/backgrounds/background-home.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        />

        {/* ── Elegant dark overlay ──
            Layer 1: deep navy/slate gradient dari atas-bawah
            Layer 2: radial vignette di sudut (gelap di pinggir)
            Layer 3: subtle emerald glow di atas untuk sentuhan sporty */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            background: `
              radial-gradient(ellipse at 50% -10%, rgba(16,185,129,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.5) 0%, transparent 60%),
              radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.5) 0%, transparent 60%),
              linear-gradient(170deg, rgba(5,14,28,0.90) 0%, rgba(4,18,20,0.85) 50%, rgba(5,14,28,0.92) 100%)
            `,
          }}
        />

        <Header />
        <main className="container mx-auto min-h-screen pt-0 md:pt-20 pb-20 md:pb-4">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}

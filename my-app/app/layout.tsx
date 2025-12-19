import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ResponsiveLayout } from "@/src/components/layout/ResponsiveLayout";
import { AuthProvider } from "@/src/contexts/AuthContext";
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
  title: "Plexus - Курсы и обучение",
  description: "Онлайн курсы повышения квалификации с сертификацией",
  openGraph: {
    title: "Plexus - Курсы и обучение",
    description: "Онлайн курсы повышения квалификации с сертификацией",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

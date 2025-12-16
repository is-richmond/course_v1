import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatSupport } from "@/src/components/ChatSupport";
import { Sidebar } from "@/src/components/layout/Sidebar";
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
  title: "MediCourse - Медицинские курсы для врачей",
  description: "Онлайн курсы повышения квалификации с сертификацией от практикующих врачей",
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
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64">
              {children}
            </main>
          </div>
          <ChatSupport />
        </AuthProvider>
      </body>
    </html>
  );
}

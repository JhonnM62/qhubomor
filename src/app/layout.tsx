import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/site/Header";
import UserNav from "@/components/site/UserNav";
import AuthProvider from "@/components/providers/AuthProvider";
import BingoProvider from "@/components/providers/BingoProvider";
import AppThemeProvider from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q'hubo Mor",
  description: "Juego de premios de la tienda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <AuthProvider>
          <AppThemeProvider>
            <BingoProvider>
              <Header />
              {children}
            </BingoProvider>
          </AppThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

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
  metadataBase: new URL('https://qhubomor.com'),
  title: "Q'hubo Mor - Los Mejores Granizados de Ipiales",
  description: "Disfruta de los mejores granizados con y sin licor en Ipiales. ¡Participa en nuestros juegos, gana premios y vive una experiencia inolvidable en Q'hubo Mor!",
  icons: {
    icon: "/images/favicon.ico",
  },
  openGraph: {
    title: "Q'hubo Mor - Los Mejores Granizados de Ipiales",
    description: "Granizados, juegos y premios en Ipiales.",
    url: 'https://qhubomor.com',
    siteName: "Q'hubo Mor",
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "00X0UsMssyLCgbGCXT-tW9eDBktC7z6MOW4vFJLVOgQ",
  },
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

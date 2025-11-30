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
    images: [
      {
        url: '/images/logo1200x630.png',
        width: 1200,
        height: 630,
        alt: "Q'hubo Mor - Granizados y Diversión",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Q'hubo Mor - Los Mejores Granizados de Ipiales",
    description: "Granizados, juegos y premios en Ipiales.",
    images: ['/images/logo1200x630.png'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Q'hubo Mor",
              image: "https://qhubomor.com/images/favicon.ico",
              description: "Los Mejores Granizados de Ipiales. Granizados con y sin licor, juegos y premios.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Mistares 3 casa 182 Diagonal al antiguo asaditos",
                addressLocality: "Ipiales",
                addressRegion: "Nariño",
                postalCode: "524060",
                addressCountry: "CO",
              },
              telephone: "+573181359070",
              url: "https://qhubomor.com",
              priceRange: "$",
            }),
          }}
        />
      </body>
    </html>
  );
}

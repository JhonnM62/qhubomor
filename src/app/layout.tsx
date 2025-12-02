import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import UserNav from "@/components/site/UserNav";
import WhatsAppButton from "@/components/site/WhatsAppButton";
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
  title: "Granizados con y sin Licor en Ipiales | Q'hubo Mor",
  description: "Los mejores Granizados con licor y sin licor en Ipiales. Disfruta de cocteles, micheladas y diversión en Q'hubo Mor. ¡Visítanos en Mistares!",
  manifest: '/manifest.json',
  keywords: ["Granizados en Ipiales", "Granizados con licor Ipiales", "Granizados sin licor Ipiales", "Cocteles Ipiales", "Bar en Ipiales", "Q'hubo Mor", "Sitios para visitar en Ipiales"],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    title: "Granizados con y sin Licor en Ipiales | Q'hubo Mor",
    description: "Disfruta de los mejores granizados con y sin licor en Ipiales. Cocteles, música y premios.",
    url: 'https://qhubomor.com',
    siteName: "Q'hubo Mor",
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/images/logo1200x630.png',
        width: 1200,
        height: 630,
        alt: "Granizados Q'hubo Mor Ipiales",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Granizados con y sin Licor en Ipiales | Q'hubo Mor",
    description: "Los mejores granizados de Nariño. Ven a disfrutar en Q'hubo Mor.",
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
              <Footer />
              <WhatsAppButton />
            </BingoProvider>
          </AppThemeProvider>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Q'hubo Mor - Granizados en Ipiales",
              image: "https://qhubomor.com/images/favicon.ico",
              description: "Los Mejores Granizados con y sin licor de Ipiales. Disfruta de cocteles, micheladas y un ambiente increíble.",
              servesCuisine: "Granizados, Cocteles, Bebidas",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Mistares 3 casa 182 Diagonal al antiguo asaditos",
                addressLocality: "Ipiales",
                addressRegion: "Nariño",
                postalCode: "524060",
                addressCountry: "CO",
              },
              telephone: "+573044430427",
              url: "https://qhubomor.com",
              priceRange: "$",
            }),
          }}
        />
      </body>
    </html>
  );
}

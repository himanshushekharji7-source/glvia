import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientShell from "./components/ClientShell";
import QueryProvider from "./components/QueryProvider";
import { AdminAuthProvider } from "./lib/adminAuth";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glvia.com"),
  title: {
    default: "glvia — Premium Beauty Marketplace",
    template: "%s | glvia"
  },
  description:
    "Discover and book premium salon, spa & beauty services near you in Uttar Pradesh. Exclusive deals, top-rated professionals, and seamless online booking.",
  keywords: [
    "salon booking Uttar Pradesh",
    "premium beauty salon Lucknow",
    "best spa Kanpur",
    "haircut booking Noida",
    "salon near me",
    "best salon in UP",
    "haircut booking",
    "bridal makeup salon",
    "beauty salon booking",
    "spa and grooming"
  ],
  alternates: {
    canonical: "/",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} antialiased`}>
      <head>
        {/* Google Analytics 4 (Dynamic via .env) */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-dvh bg-surface">
        <QueryProvider>
          <AdminAuthProvider>
            <ClientShell>{children}</ClientShell>
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

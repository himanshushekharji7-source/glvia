import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
  title: "glvia — Premium Beauty Marketplace",
  description:
    "Discover and book premium salon, spa & beauty services near you. Exclusive deals, top-rated professionals, and seamless booking.",
  keywords: ["salon", "beauty", "spa", "booking", "haircut", "nails", "massage"],
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
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
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

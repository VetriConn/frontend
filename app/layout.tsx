import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Open_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/Toaster";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_CONFIG,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

const openSans = Open_Sans({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const outfit = Outfit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Vetriconn | Jobs for Retirees & Veterans in Canada",
    template: "%s | Vetriconn",
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: "Vetriconn | Jobs for Retirees & Veterans in Canada",
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: "Vetriconn - Jobs for Retirees & Veterans in Canada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vetriconn | Jobs for Retirees & Veterans in Canada",
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${openSans.variable} ${outfit.variable}`}
      >
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}

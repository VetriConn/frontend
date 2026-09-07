import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/Toaster";
import SWRProvider from "@/components/providers/SWRProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import {
  SITE_CONFIG,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

/**
 * Self-hosted rather than fetched from Google.
 *
 * next/font/google already self-hosts at runtime, but it downloads the files
 * during the build — so a build needs network access to Google, and the family
 * can change under you between builds. These are committed instead: the same
 * bytes ship every time, and nothing leaves the origin.
 *
 * Outfit and Open Sans are variable fonts, so one file covers their whole
 * weight range. Lato has no variable cut; only the 400/700 weights anything
 * renders are shipped (300/900 were dead bytes on every page).
 * Latin subset only.
 */

const outfit = localFont({
  src: [{ path: "./fonts/outfit-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
  // Used by a single accent span on the home page — not worth a preload
  // <link> on every route. The file downloads only where the face applies.
  preload: false,
});

const openSans = localFont({
  src: [{ path: "./fonts/open-sans-300-800.woff2", weight: "300 800", style: "normal" }],
  variable: "--font-open-sans",
  display: "swap",
});

const lato = localFont({
  src: [
    { path: "./fonts/lato-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/lato-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
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
    // suppressHydrationWarning: the blocking script below intentionally
    // mutates <html> before hydration (saved text size / high contrast).
    // Suppression is attribute-level and applies to this element only.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#e53e3e" />
        <link rel="icon" href="/logo.svg" />
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
        {/* Blocking script to prevent FOUC for accessibility settings */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!(location.pathname.startsWith('/dashboard')||location.pathname.startsWith('/jobs')))return;var s=JSON.parse(localStorage.getItem('vetriconn-accessibility')||'{}');if(s.highContrast)document.documentElement.classList.add('high-contrast');if(s.textSize&&s.textSize!=='normal'){var m={'large':'112%','extra-large':'125%'};if(m[s.textSize])document.documentElement.style.fontSize=m[s.textSize]}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${lato.variable} ${openSans.variable} ${outfit.variable}`}
      >
        {/* First tabbable element on every page: keyboard users skip the
            navigation instead of walking it link by link (WCAG 2.4.1). */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SWRProvider>
          <ToasterProvider>
            <AccessibilityProvider>{children}</AccessibilityProvider>
          </ToasterProvider>
        </SWRProvider>
      </body>
    </html>
  );
}

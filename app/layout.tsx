import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { LOCALE_INIT_SCRIPT } from "@/shared/i18n/locale";
import { ServiceWorkerRegistration } from "@/shared/lib/ServiceWorkerRegistration";
import { THEME_INIT_SCRIPT } from "@/shared/theme/theme";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "TurRes Scorer", template: "%s · TurRes Scorer" },
  description: "Scoring app for applied reservist shooting matches",
  // iOS: open from the home screen without the Safari bars. The icon is `app/apple-icon.png`.
  appleWebApp: { capable: true, title: "TurRes", statusBarStyle: "default" },
  // Phone numbers in the text (competitor numbers, times) must not turn into links.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Browser bar colour follows the page background (headers share it). Sign in overrides with blue.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF2F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0B141D" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script sets data-theme before React hydrates.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

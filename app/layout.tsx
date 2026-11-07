import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { LOCALE_INIT_SCRIPT } from "@/shared/i18n/locale";
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
  title: "TurRes Scorer",
  description: "Scoring app for applied reservist shooting matches",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#005185",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

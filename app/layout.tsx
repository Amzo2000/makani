import type { Metadata } from "next";
import { Cairo, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cookies } from "next/headers";
import type { Language } from "@/types";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAKANI | Architecture & Design",
  description: "Makani architecture and design studio.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const isLanguage = (value: string | undefined): value is Language => {
  return value === "en" || value === "fr" || value === "ar";
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("makani_language")?.value;
  const initialLanguage = isLanguage(cookieLang) ? cookieLang : "en";
  const initialHasPreference = isLanguage(cookieLang);

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cairo.variable} antialiased`}>
        <Providers
          initialLanguage={initialLanguage}
          initialHasPreference={initialHasPreference}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { getSiteSettings } from "./data/site-store";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Autos usados en Buenos Aires y Zona Norte | Tu Próximo Auto",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: `${SITE_NAME} - Argentina`,
  alternates: { languages: { "es-AR": "/" } },
  openGraph: {
    siteName: `${SITE_NAME} - Argentina`,
    title: "Autos usados en Buenos Aires y Zona Norte | Tu Próximo Auto",
    description: SITE_DESCRIPTION,
    locale: "es_AR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { arsRate } = await getSiteSettings();
  return (
    <html
      lang="es-AR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the saved (or system) theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CurrencyProvider arsRate={arsRate}>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "./components/CurrencyProvider";
import { getSiteSettings } from "./data/site-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Próximo Auto - Argentina | Autos usados certificados",
  description:
    "Tu Próximo Auto - Argentina: autos usados certificados, seleccionados, inspeccionados y entregados en nuestro salón de ventas de Zona Norte (Tigre).",
  applicationName: "Tu Próximo Auto - Argentina",
  openGraph: {
    siteName: "Tu Próximo Auto - Argentina",
    title: "Tu Próximo Auto - Argentina",
    description: "Autos usados certificados con atención personalizada.",
    locale: "es_AR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currency, arsRate } = await getSiteSettings();
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
        <CurrencyProvider currency={currency} arsRate={arsRate}>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}

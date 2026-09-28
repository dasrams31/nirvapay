import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NirvaPay — Multi-Tenant QRIS Payment Gateway SaaS",
  description: "Platform aggregator dan payment gateway QRIS dinamis multi-merchant berkecepatan tinggi dengan integrasi instant API dan zero fee markup.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-astro-dark text-astro-text antialiased selection:bg-astro-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}

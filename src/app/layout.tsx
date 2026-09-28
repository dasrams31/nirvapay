import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NirvaPay — Payment Gateway QRIS Multi-Channel & Agregator Bisnis Digital",
  description: "Platform aggregator dan gateway QRIS multi-channel untuk UMKM, SaaS, Telegram Bot, dan developer.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="bg-canvas text-slate-900 min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

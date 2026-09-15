import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciwan — Oyunlar & Uygulamalar",
  description: "Ciwan'ın geliştirdiği oyunlar, uygulamalar ve deneysel projeler.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}

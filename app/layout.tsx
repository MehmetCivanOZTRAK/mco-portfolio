import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciwan Games — Ücretsiz Online Oyunlar",
  description: "Ciwan'ın geliştirdiği oyunları tarayıcıda ücretsiz oyna ve yeni yapımları keşfet.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}

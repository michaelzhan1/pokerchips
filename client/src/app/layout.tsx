import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerContextProvider } from "@/contexts/PlayerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PokerChips",
  description: "PokerChips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <PlayerContextProvider>
        <body className={inter.className}>{children}</body>
      </PlayerContextProvider>
    </html>
  );
}

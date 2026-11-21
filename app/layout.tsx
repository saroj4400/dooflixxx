import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { MyListProvider } from "@/context/MyListContext";
import { AppDownloadPopup } from "@/components/AppDownloadPopup";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Doomsplay — Cinematic Streaming & Live TV",
  description:
    "Stream movies, trending TV series, Live TV channels, trailers, and personal watchlists on Doomsplay.",
  keywords: [
    "movies",
    "tv shows",
    "live tv",
    "streaming",
    "discovery",
    "watchlist",
    "doomsplay"
  ],
  authors: [{ name: "Doomsplay Team" }]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060608"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060608] text-white antialiased selection:bg-red-600 selection:text-white w-full overflow-x-hidden">
        <AuthProvider>
        <MyListProvider>
          <Header />

          <AppDownloadPopup />

          <main className="w-full min-w-0 min-h-screen">
            {children}
          </main>

          <Footer />
          <MobileNav />
        </MyListProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

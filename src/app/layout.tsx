import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
});

// Hydration hatalarını önlemek için
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Doğa Hotel Fethiye - Residence & Seafront Hotel",
  description: "Doga Hotel Residence & Seafront Hotel. Best hotel in Fethiye. Denize sıfır konumu ve huzurlu atmosferi ile sizleri bekliyor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" style={{margin: 0, padding: 0}}>
      <body style={{margin: 0, padding: 0}} className={`${inter.className} antialiased`}>
        <Header />
        <main className="pt-0">
          {children}
        </main>
        <Toaster position="top-right" />
        {/* Footer artık [lang] layout'ında tanımlanıyor, dil bilgisi ile birlikte */}
      </body>
    </html>
  );
}

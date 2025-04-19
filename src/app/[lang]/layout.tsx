import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../app/globals.css";
import AnimatedLayout from "./AnimatedLayout";
import Footer from "../components/Footer";
import { metadata as baseMetadata } from "./i18n-metadata";
import { ScrollProgressBar } from "../../components/micro-interactions/MicroInteractions";
import WhatsAppButton from "../components/WhatsAppButton";
import MobileFixStyles from "../components/MobileFixStyles";

const inter = Inter({ subsets: ["latin"] });

export const runtime = 'nodejs';

// Geçerli dil parametreleri
export async function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }];
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // params objesini await etmemiz gerekiyor
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'tr';
  return baseMetadata[lang as keyof typeof baseMetadata] || baseMetadata.tr;
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // params objesini await etmemiz gerekiyor
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'tr';
  
  // WhatsApp butonu artık kendi içinde admin kontrolü yapıyor

  return (
    <div className={inter.className + " bg-gray-50 text-gray-900"}>
        <ScrollProgressBar />
        <MobileFixStyles />
        <AnimatedLayout>
          {children}
        </AnimatedLayout>
        <WhatsAppButton language={lang} />
        <Footer lang={lang} />
    </div>
  );
} 
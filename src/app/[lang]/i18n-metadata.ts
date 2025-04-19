import { Metadata } from "next";

// Metadata for the different languages
export const metadata: Record<string, Metadata> = {
  tr: {
    title: "Doğa Hotel - Huzurun ve Konforun Yeni Adresi",
    description: "Doğa Hotel, doğanın kalbinde konforlu konaklama imkanı sunan, lüks odaları ve şık restoranları ile unutulmaz bir tatil deneyimi yaşatan oteldir.",
    metadataBase: new URL('https://dogahotel.com'),
    keywords: ["otel", "konaklama", "tatil", "lüks otel", "doğa", "dinlenme", "seyahat", "turizm", "restoran", "lüks odalar", "spa"],
    robots: "index, follow",
    openGraph: {
      title: "Doğa Hotel - Huzurun ve Konforun Yeni Adresi",
      description: "Doğa Hotel, doğanın kalbinde konforlu konaklama imkanı sunan, lüks odaları ve şık restoranları ile unutulmaz bir tatil deneyimi.",
      siteName: "Doğa Hotel",
      images: [
        {
          url: "/images/hero/hotel.webp",
          width: 1200,
          height: 630,
          alt: "Doğa Hotel - Lüks Konaklama",
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
  },
  en: {
    title: "Doga Hotel - A New Address for Peace and Comfort",
    description: "Doga Hotel offers comfortable accommodation in the heart of nature, providing an unforgettable holiday experience with its luxurious rooms and elegant restaurants.",
    metadataBase: new URL('https://dogahotel.com'),
    keywords: ["hotel", "accommodation", "vacation", "luxury hotel", "nature", "relaxation", "travel", "tourism", "restaurant", "luxury rooms", "spa"],
    robots: "index, follow",
    openGraph: {
      title: "Doga Hotel - A New Address for Peace and Comfort",
      description: "Doga Hotel offers comfortable accommodation in the heart of nature, providing an unforgettable holiday experience with its luxurious rooms and elegant restaurants.",
      siteName: "Doga Hotel",
      images: [
        {
          url: "/images/hero/hotel.webp",
          width: 1200,
          height: 630,
          alt: "Doga Hotel - Luxury Accommodation",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  },
}; 
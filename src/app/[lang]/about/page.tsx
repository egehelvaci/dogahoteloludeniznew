import React from 'react';
import AboutPage from './AboutPage';
import { AboutData } from '../../../app/data/about';
import { executeQuery } from '../../../lib/db';

// Veritabanından about verilerini getir
async function getAboutData(): Promise<AboutData> {
  try {
    // About tablosundan veri çek
    const result = await executeQuery(`
      SELECT 
        title_tr as "titleTR",
        title_en as "titleEN",
        subtitle_tr as "subtitleTR",
        subtitle_en as "subtitleEN",
        content_tr as "contentTR",
        content_en as "contentEN",
        image_url as "imageUrl",
        badges_tr as "badgesTR",
        badges_en as "badgesEN",
        show_on_home as "showOnHome",
        position
      FROM about_sections
      WHERE show_on_home = true
      ORDER BY position ASC
      LIMIT 1
    `) as any;

    if (result.rows && result.rows.length > 0) {
      const aboutData = result.rows[0];
      
      // İçerik dizilerini ayrıştır
      const contentTR = aboutData.contentTR ? aboutData.contentTR.split('\n').filter(Boolean) : [];
      const contentEN = aboutData.contentEN ? aboutData.contentEN.split('\n').filter(Boolean) : [];
      
      // Rozet dizilerini ayrıştır
      const badgesTR = aboutData.badgesTR ? aboutData.badgesTR.split(',').map(b => b.trim()).filter(Boolean) : [];
      const badgesEN = aboutData.badgesEN ? aboutData.badgesEN.split(',').map(b => b.trim()).filter(Boolean) : [];
      
      // Hero image ve main image için aynı URL'i kullan
      const heroImage = aboutData.imageUrl || '/images/aboutus/hakkimizda.jpg';

      // Demo özellikler - sabit veriler
      const features = [
        {
          "id": "rooms",
          "iconName": "FaBed",
          "titleTR": "58 Konforlu Oda",
          "titleEN": "58 Comfortable Rooms",
          "descriptionTR": "24 standart oda, 20 triple oda, 8 suit oda ve 6 apart daire",
          "descriptionEN": "24 standard rooms, 20 triple rooms, 8 suite rooms, and 6 apart units"
        },
        {
          "id": "pools",
          "iconName": "FaSwimmingPool",
          "titleTR": "2 Yüzme Havuzu",
          "titleEN": "2 Swimming Pools",
          "descriptionTR": "Kaydıraklı havuz ve ferah yüzme havuzu ile eğlence ve dinlenme",
          "descriptionEN": "Fun and relaxation with a water slide pool and a spacious swimming pool"
        },
        {
          "id": "restaurant",
          "iconName": "FaUtensils",
          "titleTR": "Restaurant ve Cafe",
          "titleEN": "Restaurant and Cafe",
          "descriptionTR": "Tüm damak zevklerine hitap eden lezzetli menüler",
          "descriptionEN": "Delicious menus catering to all tastes"
        },
        {
          "id": "environment",
          "iconName": "FaHotel",
          "titleTR": "Huzurlu Ortam",
          "titleEN": "Peaceful Environment",
          "descriptionTR": "Zeytin ağaçları arasında huzur dolu oturma alanları",
          "descriptionEN": "Peaceful seating areas among olive trees"
        }
      ];

      return {
        titleTR: aboutData.titleTR,
        titleEN: aboutData.titleEN,
        subtitleTR: aboutData.subtitleTR,
        subtitleEN: aboutData.subtitleEN,
        contentTR,
        contentEN,
        badgesTR,
        badgesEN,
        heroImage,
        mainImage: heroImage,
        features
      };
    }
  } catch (error) {
    console.error('About verileri alınırken hata:', error);
  }
  
  // Hata durumunda varsayılan veri
  return {
    "heroImage": "/images/aboutus/hakkimizda.jpg",
    "mainImage": "/images/aboutus/hakkimizda.jpg",
    "titleTR": "Doğa Hotel",
    "titleEN": "Doga Hotel",
    "subtitleTR": "Yeşil & Mavi'nin kavuşmasına Gelin birlikte tanık olalım...",
    "subtitleEN": "Let's witness the meeting of Green & Blue together...",
    "contentTR": [
      "Doğa sevgisinin, güzelliğin ve zarafetin buluşma noktası olan otelimizde bizler, huzurun ve konforun birleştiği bu noktada doyumsuz bir tatil deneyimi gerçekleştirmeniz için uzun yılların tecrübesiyle yanınızdayız.",
      "Otelimiz 24 adet Standart oda, 20 adet Triple oda, 8 adet Suit oda (1+1), ve 6 adet Apart (2+1) toplamda 58 oda mevcut olup biri kaydıraklı 2 adet yüzme havuzlarından oluşan iki ayrı bölümden restaurant, cafe muazzam bahçesi ve zeytin ağaçları arasında huzur dolu oturma bölümlerinden oluşmaktadır."
    ],
    "contentEN": [
      "At our hotel, which is a meeting point of love of nature, beauty and elegance, we are with you with many years of experience to help you have an unsatisfactory holiday experience at this point where peace and comfort come together.",
      "Our hotel has a total of 58 rooms, consisting of 24 Standard rooms, 20 Triple rooms, 8 Suite rooms (1+1), and 6 Apart units (2+1), with two separate sections including two swimming pools (one with a water slide), a restaurant, cafe, magnificent garden, and peaceful seating areas among olive trees."
    ],
    "features": [
      {
        "id": "rooms",
        "iconName": "FaBed",
        "titleTR": "58 Konforlu Oda",
        "titleEN": "58 Comfortable Rooms",
        "descriptionTR": "24 standart oda, 20 triple oda, 8 suit oda ve 6 apart daire",
        "descriptionEN": "24 standard rooms, 20 triple rooms, 8 suite rooms, and 6 apart units"
      },
      {
        "id": "pools",
        "iconName": "FaSwimmingPool",
        "titleTR": "2 Yüzme Havuzu",
        "titleEN": "2 Swimming Pools",
        "descriptionTR": "Kaydıraklı havuz ve ferah yüzme havuzu ile eğlence ve dinlenme",
        "descriptionEN": "Fun and relaxation with a water slide pool and a spacious swimming pool"
      },
      {
        "id": "restaurant",
        "iconName": "FaUtensils",
        "titleTR": "Restaurant ve Cafe",
        "titleEN": "Restaurant and Cafe",
        "descriptionTR": "Tüm damak zevklerine hitap eden lezzetli menüler",
        "descriptionEN": "Delicious menus catering to all tastes"
      },
      {
        "id": "environment",
        "iconName": "FaHotel",
        "titleTR": "Huzurlu Ortam",
        "titleEN": "Peaceful Environment",
        "descriptionTR": "Zeytin ağaçları arasında huzur dolu oturma alanları",
        "descriptionEN": "Peaceful seating areas among olive trees"
      }
    ],
    "badgesTR": [
      "Eşsiz Deniz Manzarası",
      "Doğa ile İç İçe",
      "Muhteşem Bahçe"
    ],
    "badgesEN": [
      "Unique Sea View",
      "Surrounded by Nature",
      "Beautiful Garden"
    ]
  };
}

interface PageProps {
  params: {
    lang: string;
  };
  searchParams?: Record<string, string | string[]>;
}

export default async function Page({ params }: PageProps) {
  const lang = params.lang || 'tr';
  
  // Veritabanından veri al
  const aboutData = await getAboutData();
  
  return <AboutPage lang={lang} staticData={aboutData} />;
}

// Sayfa yeniden yapılandırma seçenekleri - önbelleği devre dışı bırakır
export const dynamic = 'force-dynamic';
export const revalidate = 0; 
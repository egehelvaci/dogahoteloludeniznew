// Ürün veri tipleri
export type Product = {
  id: string;
  image: string;
  brands?: string;
  features?: string[];
};

export type LocalizedProduct = {
  title: string;
  description: string;
  features?: string[];
  shortDescription?: string;
  brands?: string;
};

export type ProductsData = {
  [id: string]: Product & {
    localizations: {
      [lang: string]: LocalizedProduct;
    };
  };
};

// Tüm ürünler için merkezi veri kaynağı
export const products: ProductsData = {
  'mr': {
    id: 'mr',
    image: '/images/hero/MR.webp',
    brands: 'GE, Siemens, Philips',
    localizations: {
      'tr': {
        title: 'Manyetik Rezonans (MR)',
        description: 'Yüksek çözünürlüklü görüntüleme ile doğru teşhis için gelişmiş MR sistemleri. Farklı vücut bölgelerinin detaylı görüntülerini oluşturmak için güçlü manyetik alan ve radyo dalgaları kullanır.',
        shortDescription: 'Yüksek çözünürlüklü görüntüleme ile doğru teşhis için gelişmiş MR sistemleri.',
        brands: 'GE, Siemens, Philips',
        features: [
          'Yüksek çözünürlüklü görüntüleme',
          'Hasta konforu için özel tasarım',
          'Hızlı tarama seçenekleri',
          'Düşük gürültü seviyesi'
        ]
      },
      'en': {
        title: 'Magnetic Resonance (MRI)',
        description: 'Advanced MRI systems for accurate diagnosis with high-resolution imaging. Uses strong magnetic field and radio waves to create detailed images of different body parts.',
        shortDescription: 'Advanced MR systems for accurate diagnosis with high-resolution imaging.',
        brands: 'GE, Siemens, Philips',
        features: [
          'High-resolution imaging',
          'Special design for patient comfort',
          'Fast scanning options',
          'Low noise level'
        ]
      }
    }
  },
  'ct': {
    id: 'ct',
    image: '/images/hero/tomografi.webp',
    brands: 'Siemens, Canon, Toshiba, Philips, GE',
    localizations: {
      'tr': {
        title: 'Bilgisayarlı Tomografi (BT)',
        description: 'Hızlı ve hassas tarama yapabilen ileri teknoloji BT cihazları. Vücudun kesitsel görüntülerini oluşturmak için X-ışınları kullanır, böylece iç organlar, kemikler ve damarlar detaylı bir şekilde incelenebilir.',
        shortDescription: 'Hızlı ve hassas tarama yapabilen ileri teknoloji BT cihazları.',
        brands: 'Siemens, Canon, Toshiba, Philips, GE',
        features: [
          'Hızlı tarama teknolojisi',
          'Düşük radyasyon dozu',
          'Yüksek görüntü kalitesi',
          'Geniş tarama alanı'
        ]
      },
      'en': {
        title: 'Computed Tomography (CT)',
        description: 'Advanced CT devices that can perform fast and accurate scanning. Uses X-rays to create cross-sectional images of the body, allowing detailed examination of internal organs, bones, and blood vessels.',
        shortDescription: 'Advanced CT devices that can perform fast and accurate scanning.',
        brands: 'Siemens, Canon, Toshiba, Philips, GE',
        features: [
          'Fast scanning technology',
          'Low radiation dose',
          'High image quality',
          'Wide scanning area'
        ]
      }
    }
  },
  'mammography': {
    id: 'mammography',
    image: '/images/hero/mammography.webp',
    brands: 'Hologic, GE, Siemens',
    localizations: {
      'tr': {
        title: 'Mamografi',
        description: 'Meme sağlığı için erken tanıya olanak sağlayan dijital mamografi sistemleri. Özellikle meme dokusundaki anormallikleri ve potansiyel kanserleri tespit etmek için düşük dozlu X-ışınları kullanır.',
        shortDescription: 'Meme sağlığı için erken tanıya olanak sağlayan dijital mamografi sistemleri.',
        brands: 'Hologic, GE, Siemens',
        features: [
          'Dijital görüntüleme teknolojisi',
          'Düşük radyasyon dozu',
          'Yüksek hassasiyet',
          'Konforlu hasta deneyimi'
        ]
      },
      'en': {
        title: 'Mammography',
        description: 'Digital mammography systems that enable early diagnosis for breast health. Uses low-dose X-rays specifically to detect abnormalities and potential cancers in breast tissue.',
        shortDescription: 'Digital mammography systems that enable early diagnosis for breast health.',
        brands: 'Hologic, GE, Siemens',
        features: [
          'Digital imaging technology',
          'Low radiation dose',
          'High sensitivity',
          'Comfortable patient experience'
        ]
      }
    }
  },
  'xray': {
    id: 'xray',
    image: '/images/hero/xray.webp',
    brands: 'Siemens, Philips, Canon, GE',
    localizations: {
      'tr': {
        title: 'Röntgen',
        description: 'Modern ve düşük radyasyon dozlu dijital röntgen sistemleri. Kemikler, akciğerler ve bazı yumuşak doku yapıları gibi vücut içindeki yapıları hızlı bir şekilde görüntülemek için X-ışınları kullanır.',
        shortDescription: 'Modern ve düşük radyasyon dozlu dijital röntgen sistemleri.',
        brands: 'Siemens, Philips, Canon, GE',
        features: [
          'Dijital görüntüleme teknolojisi',
          'Hızlı görüntüleme',
          'Düşük radyasyon dozu',
          'Kolay kullanım'
        ]
      },
      'en': {
        title: 'X-Ray',
        description: 'Modern digital X-ray systems with low radiation dose. Uses X-rays to quickly visualize structures inside the body such as bones, lungs, and some soft tissue structures.',
        shortDescription: 'Modern digital X-ray systems with low radiation dose.',
        brands: 'Siemens, Philips, Canon, GE',
        features: [
          'Digital imaging technology',
          'Fast imaging',
          'Low radiation dose',
          'Ease of use'
        ]
      }
    }
  }
};

// İhtiyaç duyulan ürün ID'lerinin listesi (generateStaticParams için kullanılabilir)
export const productIds = Object.keys(products);

// Belirli bir dil için ürün bilgilerini alma yardımcı fonksiyonu
export function getProductsForLanguage(lang: string) {
  return Object.values(products).map(product => {
    const localization = product.localizations[lang] || product.localizations['en'];
    
    return {
      id: product.id,
      title: localization.title,
      description: localization.description,
      shortDescription: localization.shortDescription || localization.description,
      image: product.image,
      brands: localization.brands || product.brands,
      features: localization.features || []
    };
  });
}

// Belirli bir dil ve ID için ürün bilgilerini alma
export function getProductByIdForLanguage(id: string, lang: string) {
  const product = products[id];
  if (!product) return null;
  
  const localization = product.localizations[lang] || product.localizations['en'];
  
  return {
    id: product.id,
    title: localization.title,
    description: localization.description,
    shortDescription: localization.shortDescription || localization.description,
    image: product.image,
    brands: localization.brands || product.brands,
    features: localization.features || []
  };
} 
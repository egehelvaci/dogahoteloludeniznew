// Ürün detayları için statik veriler
// Bu dosya, ProductDetailPage tarafından kullanılacak ürün detaylarını içerir

type ProductDetailData = {
  [id: string]: {
    mainImage: string;
    galleryImages: string[];
    subtitle: {
      tr: string;
      en: string;
    };
    detailedFeatures: {
      tr: string[];
      en: string[];
    };
    applications: {
      tr: string[];
      en: string[];
    };
  };
};

export const productDetails: ProductDetailData = {
  'mr': {
    mainImage: '/images/hero/MR.webp',
    galleryImages: [
      'https://images.unsplash.com/photo-1516069677018-378515003435?q=80&w=2070',
      'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=2070',
      'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=2070'
    ],
    subtitle: {
      tr: 'Yüksek Kaliteli MR Sistemleri',
      en: 'High Quality MRI Systems'
    },
    detailedFeatures: {
      tr: [
        'Yüksek çözünürlüklü 3T ve 1.5T sistemler',
        'Geniş bore (tünel) tasarımı sayesinde gelişmiş hasta konforu',
        'Düşük gürültü seviyesi için özel teknoloji',
        'Hızlı tarama seçenekleri sayesinde azaltılmış tetkik süreleri',
        'Geniş FOV (görüntüleme alanı) ile tüm vücut incelemeleri',
        'Gelişmiş yazılım paketi ile hassas teşhis imkanı',
        'Yüksek hastane verimliliği için optimize edilmiş tasarım'
      ],
      en: [
        'High-resolution 3T and 1.5T systems',
        'Enhanced patient comfort thanks to wide bore (tunnel) design',
        'Special technology for low noise level',
        'Reduced examination times with fast scanning options',
        'Whole body examinations with wide FOV (field of view)',
        'Precise diagnosis with advanced software package',
        'Optimized design for high hospital efficiency'
      ]
    },
    applications: {
      tr: [
        'Nörolojik hastalıkların teşhisi',
        'Kas-iskelet sistemi bozuklukları',
        'Kardiyovasküler hastalıklar',
        'Kanser taraması ve evrelemesi',
        'Karaciğer ve böbrek hastalıkları',
        'Meme görüntüleme'
      ],
      en: [
        'Diagnosis of neurological diseases',
        'Musculoskeletal disorders',
        'Cardiovascular diseases',
        'Cancer screening and staging',
        'Liver and kidney diseases',
        'Breast imaging'
      ]
    }
  },
  'ct': {
    mainImage: '/images/hero/tomografi.webp',
    galleryImages: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2880',
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2787',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053'
    ],
    subtitle: {
      tr: 'İleri Teknoloji BT Sistemleri',
      en: 'Advanced Technology CT Systems'
    },
    detailedFeatures: {
      tr: [
        '64, 128 ve 256 kesitli ileri teknoloji sistemler',
        'Ultra düşük doz tarama teknolojisi',
        'Saniyeler içinde tüm vücut taraması yapabilme',
        'Yüksek uzaysal çözünürlük',
        'Dual energy görüntüleme özelliği',
        'Gelişmiş rekonstrüksiyon algoritmaları',
        'Metal artefakt azaltma teknolojisi'
      ],
      en: [
        '64, 128, and 256-slice advanced technology systems',
        'Ultra-low dose scanning technology',
        'Ability to scan the entire body in seconds',
        'High spatial resolution',
        'Dual energy imaging capability',
        'Advanced reconstruction algorithms',
        'Metal artifact reduction technology'
      ]
    },
    applications: {
      tr: [
        'Travma ve acil durumlar',
        'Kardiyak değerlendirmeler',
        'Onkolojik tetkikler',
        'Vasküler görüntüleme',
        'Pulmoner hastalıklar',
        'Ortopedik değerlendirmeler'
      ],
      en: [
        'Trauma and emergency situations',
        'Cardiac evaluations',
        'Oncological examinations',
        'Vascular imaging',
        'Pulmonary diseases',
        'Orthopedic evaluations'
      ]
    }
  },
  'mammography': {
    mainImage: '/images/hero/mammography.webp',
    galleryImages: [
      'https://images.unsplash.com/photo-1579684453377-968c2624e845?q=80&w=2880',
      'https://images.unsplash.com/photo-1576671414121-aa0c8b38c613?q=80&w=2898',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070'
    ],
    subtitle: {
      tr: 'Dijital Mamografi Sistemleri',
      en: 'Digital Mammography Systems'
    },
    detailedFeatures: {
      tr: [
        'Dijital ve 3D (tomosentez) görüntüleme teknolojisi',
        'Düşük doz radyasyon ile yüksek kaliteli görüntüler',
        'Otomatik meme yoğunluğu değerlendirmesi',
        'Bilgisayar destekli teşhis (CAD) sistemi',
        'Ergonomik tasarım ile arttırılmış hasta konforu',
        'Hızlı tetkik süresi',
        'Entegre biyopsi yapabilme özelliği'
      ],
      en: [
        'Digital and 3D (tomosynthesis) imaging technology',
        'High-quality images with low radiation dose',
        'Automatic breast density assessment',
        'Computer-aided diagnosis (CAD) system',
        'Enhanced patient comfort with ergonomic design',
        'Quick examination time',
        'Integrated biopsy capability'
      ]
    },
    applications: {
      tr: [
        'Meme kanseri taraması',
        'Meme lezyonlarının değerlendirilmesi',
        'Meme dokusundaki kalsifikasyonların tespiti',
        'Meme biyopsisi için rehberlik',
        'Meme implantlarının değerlendirilmesi',
        'Meme yoğunluğu analizi'
      ],
      en: [
        'Breast cancer screening',
        'Evaluation of breast lesions',
        'Detection of calcifications in breast tissue',
        'Guidance for breast biopsy',
        'Evaluation of breast implants',
        'Breast density analysis'
      ]
    }
  },
  'xray': {
    mainImage: '/images/hero/xray.webp',
    galleryImages: [
      'https://images.unsplash.com/photo-1571772996211-2f02974a9f91?q=80&w=2070',
      'https://images.unsplash.com/photo-1512615199361-5c7a1283b488?q=80&w=2069',
      'https://images.unsplash.com/photo-1581595219315-a187dd41c89c?q=80&w=2070'
    ],
    subtitle: {
      tr: 'Dijital Röntgen Sistemleri',
      en: 'Digital X-Ray Systems'
    },
    detailedFeatures: {
      tr: [
        'Tamamen dijital görüntüleme teknolojisi',
        'Düşük doz X-ışını emisyonu',
        'Yüksek çözünürlüklü detektörler',
        'Hızlı görüntü işleme sistemi',
        'Çok yönlü pozisyonlama imkanı',
        'Otomatik dozaj ayarı',
        'PACS entegrasyonu'
      ],
      en: [
        'Fully digital imaging technology',
        'Low dose X-ray emission',
        'High-resolution detectors',
        'Fast image processing system',
        'Versatile positioning capability',
        'Automatic dosage adjustment',
        'PACS integration'
      ]
    },
    applications: {
      tr: [
        'Kemik kırıkları ve çatlakları',
        'Akciğer hastalıkları',
        'Eklem bozuklukları',
        'Diş sağlığı',
        'Yabancı cisimlerin tespiti',
        'Ortopedik değerlendirmeler'
      ],
      en: [
        'Bone fractures and cracks',
        'Lung diseases',
        'Joint disorders',
        'Dental health',
        'Detection of foreign objects',
        'Orthopedic evaluations'
      ]
    }
  }
}; 
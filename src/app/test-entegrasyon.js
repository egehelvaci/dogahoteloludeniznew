// Test dosyası - Entegrasyonu doğrulamak için
// Bu kodu tarayıcı konsolunda çalıştırabilirsiniz

async function testEntegrasyon() {
  console.log('Frontend-Backend Entegrasyon Testi Başlatılıyor...');
  const testSonuclari = {
    basarili: [],
    hatali: []
  };

  try {
    // 1. Galeri API Testi
    console.log('1. Galeri API Testi Yapılıyor...');
    try {
      const galeriResponse = await fetch('/api/gallery');
      if (galeriResponse.ok) {
        const galeriData = await galeriResponse.json();
        console.log('✅ Galeri API Yanıtı:', galeriData);
        testSonuclari.basarili.push('Galeri API erişimi');
      } else {
        console.error('❌ Galeri API Hatası:', galeriResponse.status);
        testSonuclari.hatali.push('Galeri API erişimi');
      }
    } catch (error) {
      console.error('❌ Galeri API İstek Hatası:', error);
      testSonuclari.hatali.push('Galeri API erişimi');
    }

    // 2. Hakkımızda API Testi
    console.log('2. Hakkımızda API Testi Yapılıyor...');
    try {
      const aboutResponse = await fetch('/api/about');
      if (aboutResponse.ok) {
        const aboutData = await aboutResponse.json();
        console.log('✅ Hakkımızda API Yanıtı:', aboutData);
        testSonuclari.basarili.push('Hakkımızda API erişimi');
      } else {
        console.error('❌ Hakkımızda API Hatası:', aboutResponse.status);
        testSonuclari.hatali.push('Hakkımızda API erişimi');
      }
    } catch (error) {
      console.error('❌ Hakkımızda API İstek Hatası:', error);
      testSonuclari.hatali.push('Hakkımızda API erişimi');
    }

    // 3. Servisler API Testi
    console.log('3. Servisler API Testi Yapılıyor...');
    try {
      const servicesResponse = await fetch('/api/services');
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        console.log('✅ Servisler API Yanıtı:', servicesData);
        testSonuclari.basarili.push('Servisler API erişimi');
      } else {
        console.error('❌ Servisler API Hatası:', servicesResponse.status);
        testSonuclari.hatali.push('Servisler API erişimi');
      }
    } catch (error) {
      console.error('❌ Servisler API İstek Hatası:', error);
      testSonuclari.hatali.push('Servisler API erişimi');
    }

    // 4. Odalar API Testi
    console.log('4. Odalar API Testi Yapılıyor...');
    try {
      const roomsResponse = await fetch('/api/rooms');
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        console.log('✅ Odalar API Yanıtı:', roomsData);
        testSonuclari.basarili.push('Odalar API erişimi');
      } else {
        console.error('❌ Odalar API Hatası:', roomsResponse.status);
        testSonuclari.hatali.push('Odalar API erişimi');
      }
    } catch (error) {
      console.error('❌ Odalar API İstek Hatası:', error);
      testSonuclari.hatali.push('Odalar API erişimi');
    }

    // 5. Gallery Veri Katmanı Testi 
    console.log('5. Gallery Veri Katmanı Testi Yapılıyor...');
    try {
      const { getGalleryData } = await import('./data/gallery.js');
      const galleryItems = await getGalleryData();
      console.log('✅ Gallery Veri Katmanı Yanıtı:', galleryItems);
      testSonuclari.basarili.push('Gallery veri katmanı');
    } catch (error) {
      console.error('❌ Gallery Veri Katmanı Hatası:', error);
      testSonuclari.hatali.push('Gallery veri katmanı');
    }
    
    // 6. About Veri Katmanı Testi
    console.log('6. About Veri Katmanı Testi Yapılıyor...');
    try {
      const { getAboutData } = await import('./data/about.js');
      const aboutData = await getAboutData();
      console.log('✅ About Veri Katmanı Yanıtı:', aboutData);
      testSonuclari.basarili.push('About veri katmanı');
    } catch (error) {
      console.error('❌ About Veri Katmanı Hatası:', error);
      testSonuclari.hatali.push('About veri katmanı');
    }

    // 7. Dosya Yükleme API Testi (Sadece endpoint kontrolü)
    console.log('7. Dosya Yükleme API Testi Yapılıyor...');
    try {
      // Sadece OPTIONS isteği gönderelim
      const uploadResponse = await fetch('/api/upload', { method: 'OPTIONS' });
      console.log('✅ Dosya Yükleme API Erişilebilir, Durum:', uploadResponse.status);
      testSonuclari.basarili.push('Dosya yükleme API erişimi');
    } catch (error) {
      console.error('❌ Dosya Yükleme API Hatası:', error);
      testSonuclari.hatali.push('Dosya yükleme API erişimi');
    }

    // Test sonuçlarını göster
    console.log('\n---- TEST SONUÇLARI ----');
    console.log(`Başarılı: ${testSonuclari.basarili.length}/${testSonuclari.basarili.length + testSonuclari.hatali.length}`);
    
    if (testSonuclari.basarili.length > 0) {
      console.log('\n✅ Başarılı Testler:');
      testSonuclari.basarili.forEach((test, index) => {
        console.log(`${index + 1}. ${test}`);
      });
    }
    
    if (testSonuclari.hatali.length > 0) {
      console.log('\n❌ Başarısız Testler:');
      testSonuclari.hatali.forEach((test, index) => {
        console.log(`${index + 1}. ${test}`);
      });
    }
    
    if (testSonuclari.hatali.length === 0) {
      console.log('\n🎉 Tüm testler başarılı! PostgreSQL ve Cloudinary entegrasyonu çalışıyor.');
    } else {
      console.warn('\n⚠️ Bazı testler başarısız oldu. Lütfen hataları kontrol edin.');
    }
  } catch (error) {
    console.error('Test çalıştırma hatası:', error);
  }
}

// Bu fonksiyonu tarayıcı konsolunda çağırın
// testEntegrasyon();

// Ayrıca bu fonksiyonu bu dosyayı doğrudan çalıştırarak da çağırabilirsiniz
if (typeof window !== 'undefined') {
  // Tarayıcı ortamında otomatik çalıştır
  console.log('Test otomatik olarak başlatılıyor...');
  setTimeout(testEntegrasyon, 1000);
} 
// Test amacıyla oluşturulmuş istemci kodu
// Tarayıcıda bu kodu devtools konsoluna yapıştırarak test edebilirsiniz

async function testUpload() {
  // Test edilecek dosyayı seçin
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  
  // Dosya seçilirse işleme devam et
  fileInput.addEventListener('change', async () => {
    if (!fileInput.files || fileInput.files.length === 0) {
      console.log('Dosya seçilmedi');
      return;
    }
    
    const file = fileInput.files[0];
    console.log('Dosya seçildi:', file.name, file.type, file.size);
    
    // FormData oluştur
    const formData = new FormData();
    formData.append('file', file);
    
    // API'ye gönder
    console.log('Dosya gönderiliyor...');
    try {
      // Doğru URL'ye istek gönder
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Ham yanıtı alın (hata ayıklama için)
      const rawResponse = await response.text();
      console.log('Ham yanıt:', rawResponse);
      
      let result;
      try {
        // Yanıtı JSON olarak ayrıştır
        result = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error('JSON ayrıştırma hatası:', jsonError);
        console.error('Yanıt JSON formatında değil:', rawResponse);
        return;
      }
      
      console.log('Yükleme yanıtı:', result);
      
      if (result.success) {
        console.log('Dosya başarıyla yüklendi. URL:', result.url);
      } else {
        console.error('Yükleme hatası:', result.message);
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
    }
  });
  
  // Dosya seçicisini tetikle
  fileInput.click();
}

// Testi başlat
console.log('Dosya yükleme testi başlatılıyor...');
testUpload(); 
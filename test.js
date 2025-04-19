// test.js - Servis API'sini test etmek için basit bir komut dosyası

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Test verisi
const testData = {
  id: uuidv4(),
  titleTR: "Test Servisi",
  titleEN: "Test Service",
  descriptionTR: "Bu bir test servisidir",
  descriptionEN: "This is a test service",
  detailsTR: ["Özellik 1", "Özellik 2"],
  detailsEN: ["Feature 1", "Feature 2"],
  icon: "spa",
  active: true,
  image: "",
  images: []
};

// API çağrısı
async function testAPI() {
  try {
    console.log("Servis ekleme API'si test ediliyor...");
    console.log("Gönderilen veri:", JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/admin/services/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    console.log("Ham API yanıtı:", responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log("API yanıtı:", JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log("Test başarılı! Servis başarıyla eklendi. ID:", data.id);
      } else {
        console.log("Test başarısız:", data.message);
      }
    } catch (parseError) {
      console.error("JSON parse hatası:", parseError);
    }
  } catch (error) {
    console.error("Test sırasında hata:", error);
  }
}

// Testi çalıştır
testAPI(); 
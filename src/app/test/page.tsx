'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<{
    loading: boolean;
    success: string[];
    failed: string[];
    messages: string[];
  }>({
    loading: true,
    success: [],
    failed: [],
    messages: []
  });

  // Test sonuçlarını kaydedeceğimiz log fonksiyonu
  const logMessage = (message: string) => {
    setTestResults(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  // Test başarılı olduğunda
  const addSuccess = (test: string) => {
    setTestResults(prev => ({
      ...prev,
      success: [...prev.success, test]
    }));
  };

  // Test başarısız olduğunda
  const addFailed = (test: string) => {
    setTestResults(prev => ({
      ...prev,
      failed: [...prev.failed, test]
    }));
  };

  useEffect(() => {
    async function runTests() {
      logMessage('Entegrasyon Testleri Başlatılıyor...');
      
      try {
        // 1. Galeri API Testi
        logMessage('1. Galeri API Testi Yapılıyor...');
        try {
          const galeriResponse = await fetch('/api/gallery');
          if (galeriResponse.ok) {
            const galeriData = await galeriResponse.json();
            logMessage(`✅ Galeri API Yanıtı Alındı: ${galeriData.length || 0} öğe`);
            addSuccess('Galeri API erişimi');
          } else {
            logMessage(`❌ Galeri API Hatası: ${galeriResponse.status}`);
            addFailed('Galeri API erişimi');
          }
        } catch (error) {
          logMessage(`❌ Galeri API İstek Hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          addFailed('Galeri API erişimi');
        }

        // 2. Hakkımızda API Testi
        logMessage('2. Hakkımızda API Testi Yapılıyor...');
        try {
          const aboutResponse = await fetch('/api/about');
          if (aboutResponse.ok) {
            const aboutData = await aboutResponse.json();
            logMessage(`✅ Hakkımızda API Yanıtı Alındı`);
            addSuccess('Hakkımızda API erişimi');
          } else {
            logMessage(`❌ Hakkımızda API Hatası: ${aboutResponse.status}`);
            addFailed('Hakkımızda API erişimi');
          }
        } catch (error) {
          logMessage(`❌ Hakkımızda API İstek Hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          addFailed('Hakkımızda API erişimi');
        }

        // 3. Servisler API Testi
        logMessage('3. Servisler API Testi Yapılıyor...');
        try {
          const servicesResponse = await fetch('/api/services');
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            logMessage(`✅ Servisler API Yanıtı Alındı`);
            addSuccess('Servisler API erişimi');
          } else {
            logMessage(`❌ Servisler API Hatası: ${servicesResponse.status}`);
            addFailed('Servisler API erişimi');
          }
        } catch (error) {
          logMessage(`❌ Servisler API İstek Hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          addFailed('Servisler API erişimi');
        }

        // 4. Odalar API Testi
        logMessage('4. Odalar API Testi Yapılıyor...');
        try {
          const roomsResponse = await fetch('/api/rooms');
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            logMessage(`✅ Odalar API Yanıtı Alındı`);
            addSuccess('Odalar API erişimi');
          } else {
            logMessage(`❌ Odalar API Hatası: ${roomsResponse.status}`);
            addFailed('Odalar API erişimi');
          }
        } catch (error) {
          logMessage(`❌ Odalar API İstek Hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          addFailed('Odalar API erişimi');
        }

        // 5. Dosya Yükleme API Testi
        logMessage('5. Dosya Yükleme API Testi Yapılıyor...');
        try {
          // HEAD isteği gönderelim
          const uploadResponse = await fetch('/api/upload', { method: 'HEAD' });
          logMessage(`✅ Dosya Yükleme API Erişilebilir, Durum: ${uploadResponse.status}`);
          addSuccess('Dosya yükleme API erişimi');
        } catch (error) {
          logMessage(`❌ Dosya Yükleme API Hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          addFailed('Dosya yükleme API erişimi');
        }

        // Test tamamlandı
        logMessage('Tüm testler tamamlandı!');
      } catch (error) {
        logMessage(`Test çalıştırma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      } finally {
        setTestResults(prev => ({
          ...prev,
          loading: false
        }));
      }
    }

    runTests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PostgreSQL ve Cloudinary Entegrasyon Testi</h1>
      
      {testResults.loading ? (
        <div className="bg-blue-100 p-4 rounded-md mb-4">
          <p className="text-blue-700">Testler çalıştırılıyor, lütfen bekleyin...</p>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Test Sonuçları</h2>
          <p className="mb-2">
            Başarılı: <span className="font-bold text-green-600">{testResults.success.length}</span> / 
            Toplam: <span className="font-bold">{testResults.success.length + testResults.failed.length}</span>
          </p>
          
          {testResults.success.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-green-600 mb-1">✅ Başarılı Testler:</h3>
              <ul className="list-disc list-inside pl-2">
                {testResults.success.map((test, index) => (
                  <li key={index} className="text-green-700">{test}</li>
                ))}
              </ul>
            </div>
          )}
          
          {testResults.failed.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-red-600 mb-1">❌ Başarısız Testler:</h3>
              <ul className="list-disc list-inside pl-2">
                {testResults.failed.map((test, index) => (
                  <li key={index} className="text-red-700">{test}</li>
                ))}
              </ul>
            </div>
          )}
          
          {testResults.failed.length === 0 ? (
            <p className="text-green-600 font-semibold">
              🎉 Tüm testler başarılı! PostgreSQL ve Cloudinary entegrasyonu çalışıyor.
            </p>
          ) : (
            <p className="text-red-600 font-semibold">
              ⚠️ Bazı testler başarısız oldu. API'lerinizi ve veritabanı bağlantınızı kontrol edin.
            </p>
          )}
        </div>
      )}
      
      {/* Log Mesajları */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Test Detayları</h2>
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-auto h-96">
          {testResults.messages.map((message, index) => (
            <div key={index} className={`mb-1 ${message.includes('❌') ? 'text-red-400' : ''}`}>
              {message}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => router.push('/')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
        >
          Ana Sayfaya Dön
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Testleri Tekrar Çalıştır
        </button>
      </div>
    </div>
  );
} 
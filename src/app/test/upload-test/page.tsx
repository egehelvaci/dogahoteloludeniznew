'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadTestPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    fileUrl?: string;
    error?: string;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log mesajı ekleme
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Dosya seçildiğinde
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(`Dosya seçildi: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`);
    
    setSelectedFile(file);
    
    // Önizleme oluştur
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Önceki upload sonucunu temizle
    setUploadResult(null);
  };

  // Dosya yükleme
  const handleUpload = async () => {
    if (!selectedFile) {
      addLog('Hata: Lütfen önce bir dosya seçin');
      return;
    }

    setUploading(true);
    addLog('Dosya yükleniyor...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'test');

      addLog(`API isteği gönderiliyor: /api/upload`);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Yükleme hatası');
      }

      addLog(`✅ Dosya başarıyla yüklendi!`);
      addLog(`📝 ImageKit URL: ${data.fileUrl}`);
      
      setUploadResult({
        success: true,
        fileUrl: data.fileUrl
      });
    } catch (error) {
      addLog(`❌ Yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    } finally {
      setUploading(false);
    }
  };

  // Testi tamamla
  const handleComplete = () => {
    router.push('/test');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ImageKit Dosya Yükleme Testi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Dosya Seçimi</h2>
            
            {/* Dosya önizleme */}
            <div className="border rounded-lg bg-gray-50 p-4 mb-4 h-72 flex items-center justify-center">
              {previewUrl ? (
                selectedFile?.type.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt="Önizleme" 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-medium">{selectedFile?.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedFile?.type} - {(selectedFile?.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500">
                  <p>Dosya seçilmedi</p>
                  <p className="text-sm">Lütfen bir görsel veya dosya seçin.</p>
                </div>
              )}
            </div>
            
            {/* Dosya seçme ve yükleme butonları */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-1"
                disabled={uploading}
              >
                Dosya Seç
              </button>
              
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex-1"
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Yükleniyor...' : 'ImageKit\'ye Yükle'}
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*"
              />
            </div>
          </div>
          
          {/* Yükleme sonuçları */}
          {uploadResult && (
            <div className={`border rounded-lg p-4 mb-4 ${
              uploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h2 className="text-lg font-semibold mb-2">
                {uploadResult.success ? '✅ Yükleme Başarılı' : '❌ Yükleme Başarısız'}
              </h2>
              
              {uploadResult.success ? (
                <>
                  <p className="mb-2">Dosya ImageKit'ye başarıyla yüklendi!</p>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">ImageKit URL:</label>
                    <input 
                      type="text" 
                      value={uploadResult.fileUrl} 
                      readOnly 
                      className="w-full px-3 py-2 border rounded-md text-sm bg-white" 
                    />
                  </div>
                  
                  {uploadResult.fileUrl && uploadResult.fileUrl.includes('/image/upload/') && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Yüklenen Görsel:</h3>
                      <img 
                        src={uploadResult.fileUrl} 
                        alt="Yüklenen görsel" 
                        className="max-h-32 max-w-full border rounded-md" 
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-red-600">{uploadResult.error}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Log paneli */}
        <div>
          <div className="bg-black text-green-400 font-mono rounded-lg p-4 h-[500px] overflow-auto">
            <h2 className="text-white text-sm mb-2 pb-2 border-b border-gray-700">İşlem Kayıtları</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">İşlem kaydı yok.</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`text-xs mb-1 ${
                    log.includes('❌') ? 'text-red-400' : 
                    log.includes('✅') ? 'text-green-400' : 
                    log.includes('📝') ? 'text-blue-400' : ''
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => router.push('/test')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Test Sayfasına Dön
            </button>
            
            <button
              onClick={handleComplete}
              className={`px-4 py-2 rounded-md ${
                uploadResult?.success 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!uploadResult?.success}
            >
              Testi Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
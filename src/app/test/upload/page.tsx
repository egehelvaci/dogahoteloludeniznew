'use client';

import React, { useState } from 'react';
import MediaUploader from '../../../components/ui/MediaUploader';
import ImageKitImage from '../../../components/ui/ImageKitImage';
import ImageKitVideo from '../../../components/ui/ImageKitVideo';

interface UploadResult {
  url: string;
  fileId: string;
  fileType: string;
}

export default function UploadTestPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = async (result: UploadResult) => {
    setUploadResult(result);
    setError(null);
    console.log('Yükleme başarılı:', result);
  };
  
  // Medya türünü dosya uzantısına göre belirle
  const isVideoFile = (url?: string): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Tebi.io Yükleme Testi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Dosya Yükleme</h2>
          
          <MediaUploader
            onUpload={handleUpload}
            folder="test"
            label="Resim veya Video Yükle"
            apiEndpoint="/api/test/upload"
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              <p className="font-semibold">Hata:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Yükleme Sonucu</h2>
          
          {!uploadResult ? (
            <div className="text-gray-500 italic">
              Henüz bir dosya yüklenmedi. Yükleme yaptıktan sonra sonuçlar burada görünecektir.
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Önizleme:</h3>
                {isVideoFile(uploadResult?.url) || uploadResult?.fileType === 'video' ? (
                  uploadResult?.url ? (
                    <video
                      src={uploadResult.url}
                      width="100%"
                      height={250}
                      controls
                      className="object-contain w-full h-auto max-h-[250px]"
                    />
                  ) : (
                    <div className="w-full h-[250px] flex items-center justify-center bg-gray-100 text-gray-400">
                      Önizleme yok
                    </div>
                  )
                ) : (
                  uploadResult?.url ? (
                    <img
                      src={uploadResult.url}
                      alt="Yüklenen görsel"
                      width={400}
                      height={250}
                      className="object-contain w-full h-auto max-h-[250px]"
                    />
                  ) : (
                    <div className="w-full h-[250px] flex items-center justify-center bg-gray-100 text-gray-400">
                      Önizleme yok
                    </div>
                  )
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">URL:</span> 
                  <a href={uploadResult?.url || "#"} target="_blank" rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline break-all">
                    {uploadResult?.url || '-'}
                  </a>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Dosya ID:</span> 
                  <span className="text-gray-700 break-all">{uploadResult?.fileId || '-'}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Dosya Türü:</span> 
                  <span className="text-gray-700">{uploadResult?.fileType || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Tebi.io API Kullanımı</h2>
        
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Tebi.io API Ayarları (.env.local)
# Tebi.io çoklu protokol desteği
TEBI_BUCKET=dogahotelfethiye     # Bucket adı
TEBI_API_KEY=**********          # Bucket Key (S3 erişim için)
TEBI_MASTER_KEY=**********       # Bucket Secret (S3 erişim için)

// MediaUploader bileşeni kullanımı
<MediaUploader
  onUpload={(result) => console.log(result)}
  folder="test"
  maxSizeMB={100}
  apiEndpoint="/api/test/upload"
/>

// Video görüntüleme - S3 protokolü
<video
  src="https://s3.tebi.io/dogahotelfethiye/test/ornek.mp4"
  width="100%"
  height={300}
  controls
/>

// Görsel görüntüleme - S3 protokolü
<img
  src="https://s3.tebi.io/dogahotelfethiye/test/ornek.jpg"
  alt="Resim açıklaması"
  width={400}
  height={300}
/>
`}
</pre>
      </div>
    </div>
  );
}
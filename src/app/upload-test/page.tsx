'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);
      
      // Seçilen dosyanın önizlemesini göster
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Dosya yükleniyor:', file.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      // Yanıtı text olarak al
      const responseText = await response.text();
      console.log('Ham yanıt:', responseText);

      // JSON olarak ayrıştırmayı dene
      try {
        const jsonResult = JSON.parse(responseText);
        setResult(jsonResult);
      } catch (jsonError) {
        console.error('JSON ayrıştırma hatası:', jsonError);
        setError(`JSON ayrıştırma hatası: ${responseText}`);
      }
    } catch (err) {
      console.error('Yükleme hatası:', err);
      setError(`Yükleme hatası: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Dosya türünü kontrol et
  const isImage = file?.type.startsWith('image/');
  const isVideo = file?.type.startsWith('video/');
  const isPDF = file?.type === 'application/pdf';

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dosya Yükleme Testi</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Bir dosya seçin</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm border border-gray-300 rounded p-2"
        />
      </div>
      
      {file && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p><strong>Seçilen dosya:</strong> {file.name}</p>
          <p><strong>Boyut:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          <p><strong>Tür:</strong> {file.type}</p>
          
          {/* Dosya önizlemesi - Seçilen dosya için */}
          {preview && isImage && (
            <div className="mt-3">
              <p className="font-medium mb-2">Önizleme:</p>
              <div className="border border-gray-300 rounded overflow-hidden max-h-60 flex items-center justify-center bg-white">
                <img 
                  src={preview} 
                  alt="Önizleme" 
                  className="max-w-full max-h-60 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Yükleniyor...' : 'Dosyayı Yükle'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          <h3 className="font-bold">Hata</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          <h3 className="font-bold">Sonuç</h3>
          <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.success && result.url && (
            <div className="mt-3">
              <p className="font-bold">Yüklenen Dosya:</p>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {result.url}
              </a>
              
              {/* Yüklenen dosya önizlemesi */}
              {result.fileType && (
                <div className="mt-3">
                  <p className="font-medium mb-2">Önizleme:</p>
                  
                  {/* Resim önizlemesi */}
                  {result.fileType.startsWith('image/') && (
                    <div className="border border-gray-300 rounded overflow-hidden mt-2 bg-white p-1">
                      <img 
                        src={result.url} 
                        alt={result.fileName} 
                        className="max-w-full h-auto max-h-80 object-contain mx-auto"
                      />
                    </div>
                  )}
                  
                  {/* Video önizlemesi */}
                  {result.fileType.startsWith('video/') && (
                    <div className="border border-gray-300 rounded overflow-hidden mt-2 bg-white p-1">
                      <video 
                        src={result.url} 
                        controls 
                        className="max-w-full max-h-80"
                      >
                        Tarayıcınız video etiketini desteklemiyor.
                      </video>
                    </div>
                  )}
                  
                  {/* PDF önizlemesi */}
                  {result.fileType === 'application/pdf' && (
                    <div className="border border-gray-300 rounded mt-2 p-2 bg-white">
                      <iframe 
                        src={result.url} 
                        width="100%" 
                        height="400" 
                        className="border-0"
                      >
                        Tarayıcınız iframe'i desteklemiyor.
                      </iframe>
                    </div>
                  )}
                  
                  {/* Diğer dosya türleri */}
                  {!result.fileType.startsWith('image/') && 
                   !result.fileType.startsWith('video/') && 
                   result.fileType !== 'application/pdf' && (
                    <div className="mt-2 flex items-center justify-center p-4 bg-gray-100 rounded">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          Bu dosya türü için önizleme kullanılamıyor
                        </p>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Dosyayı İndir
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
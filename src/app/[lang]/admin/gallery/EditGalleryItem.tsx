// Videolardan thumbnail oluşturma
const generateVideoThumbnail = async (videoSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Video elementi oluştur
      const videoElement = document.createElement('video');
      videoElement.crossOrigin = "anonymous"; // CORS hatalarını önle
      videoElement.preload = 'metadata';
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      // Video yükleme olayını dinle
      videoElement.addEventListener('loadedmetadata', () => {
        // 3 saniyeye veya video süresinin 1/4'üne git
        videoElement.currentTime = Math.min(3, videoElement.duration / 4);
      });
      
      // Belirtilen zamana atlandığında
      videoElement.addEventListener('seeked', () => {
        try {
          // Canvas oluştur ve video frame'ini çiz
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject("Canvas context oluşturulamadı");
            return;
          }
          
          // Video frame'ini canvas'a çiz
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // JPEG formatında data URL'e dönüştür
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Başarılı sonuç
          resolve(thumbnailDataUrl);
        } catch (error) {
          console.error("Thumbnail oluşturma hatası:", error);
          reject(error);
        }
      });
      
      // Hata durumunda
      videoElement.addEventListener('error', (e) => {
        console.error("Video yükleme hatası:", e);
        reject("Video yüklenemedi");
      });
      
      // Video kaynağını ayarla ve yüklemeyi başlat
      videoElement.src = videoSrc;
      videoElement.load();
      
    } catch (error) {
      console.error("Video thumbnail oluşturma hatası:", error);
      reject(error);
    }
  });
};

// DataURL'i File nesnesine dönüştür
const dataURLtoFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

// Video için thumbnail oluştur butonu ve fonksiyonu
const renderGenerateThumbnailButton = () => {
  if (formData.type !== 'video' || !formData.videoUrl) return null;
  
  const handleGenerateThumbnail = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Video URL'den thumbnail oluşturma işlemini başlat
      toast.info('Video işleniyor, lütfen bekleyin...');
      
      // Video URL'den thumbnail oluştur
      const thumbnailDataUrl = await generateVideoThumbnail(formData.videoUrl);
      
      // Thumbnail dosyasını oluştur
      const thumbnailFile = dataURLtoFile(
        thumbnailDataUrl, 
        `thumbnail_${new Date().getTime()}.jpg`
      );
      
      // FormData oluştur ve thumbnail'i yükle
      const formDataObj = new FormData();
      formDataObj.append('file', thumbnailFile);
      formDataObj.append('folder', 'gallery/thumbnails');
      
      // Upload durumunu güncelle
      toast.info('Thumbnail yükleniyor...');
      
      // Thumbnail'i yükle
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj
      });
      
      if (!response.ok) {
        throw new Error('Thumbnail yüklenemedi: ' + response.statusText);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Thumbnail yükleme başarısız');
      }
      
      // Başarılı sonuç log
      console.log('Thumbnail başarıyla oluşturuldu:', {
        url: result.url,
        boyut: thumbnailFile.size
      });
      
      // Formu güncelle - imageUrl'i thumbnail ile değiştir
      setFormData({
        ...formData,
        imageUrl: result.url,
        thumbnailUrl: result.url // Özel thumbnail URL'i de ayarla
      });
      
      // Toast mesajı göster
      toast.success('Thumbnail başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Thumbnail oluşturma hatası:', error);
      setError('Thumbnail oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      toast.error('Thumbnail oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleGenerateThumbnail}
        disabled={isLoading}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaImage className="mr-2" />
        )}
        Video'dan Kapak Resmi Oluştur
      </button>
      <p className="text-sm text-gray-500 mt-1">
        Bu işlem videodan otomatik olarak bir kapak resmi oluşturacaktır.
      </p>
    </div>
  );
};

{/* Form Grupları */}
<div className="space-y-4">
  {/* Tip Seçimi */}
  <div className="mb-4">
    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
      {lang === 'tr' ? 'Tip' : 'Type'}
    </label>
    <select
      id="type"
      name="type"
      value={formData.type}
      onChange={handleInputChange}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
    >
      <option value="image">{lang === 'tr' ? 'Görsel' : 'Image'}</option>
      <option value="video">{lang === 'tr' ? 'Video' : 'Video'}</option>
    </select>
  </div>

  {/* Video URL - Sadece video tipinde göster */}
  {formData.type === 'video' && (
    <div className="mb-4">
      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
        {lang === 'tr' ? 'Video URL' : 'Video URL'}
      </label>
      <input
        type="text"
        id="videoUrl"
        name="videoUrl"
        value={formData.videoUrl || ''}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
        placeholder="https://example.com/video.mp4"
      />
      <p className="text-sm text-gray-500 mt-1">
        {lang === 'tr' ? 'MP4, WebM, vb. video formatları desteklenir' : 'MP4, WebM, etc. video formats are supported'}
      </p>
    </div>
  )}

  {/* Thumbnail Oluşturma Butonu - Sadece video için */}
  {renderGenerateThumbnailButton()}

  {/* İmaj URL */}
  <div className="mb-4">
    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
      {formData.type === 'video' 
        ? (lang === 'tr' ? 'Video Thumbnail URL (Kapak Resmi)' : 'Video Thumbnail URL')
        : (lang === 'tr' ? 'Görsel URL' : 'Image URL')}
    </label>
    <input
      type="text"
      id="imageUrl"
      name="imageUrl"
      value={formData.imageUrl || ''}
      onChange={handleInputChange}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
      placeholder="https://example.com/image.jpg"
    />
    <p className="text-sm text-gray-500 mt-1">
      {formData.type === 'video'
        ? (lang === 'tr' ? 'Video için kapak resmi (thumbnail) URL\'si' : 'Thumbnail URL for the video')
        : (lang === 'tr' ? 'JPG, PNG, WebP, vb. görsel formatları desteklenir' : 'JPG, PNG, WebP, etc. image formats are supported')}
    </p>
  </div>
</div> 
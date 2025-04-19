"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUpload, FaSave, FaYoutube, FaPlay, FaVideo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { GalleryItem } from '../../data/gallery';
import VideoThumbGenerator from '../../components/VideoThumbGenerator';

interface GalleryFormProps {
  initialData?: GalleryItem;
  isEditing?: boolean;
}

export default function GalleryForm({ initialData, isEditing = false }: GalleryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [formData, setFormData] = useState({
    titleTR: '',
    titleEN: '',
    descriptionTR: '',
    descriptionEN: '',
    image: '',
    category: 'genel',
    active: true,
    youtubeUrl: '',
    videoUrl: '',
    type: 'image' as 'image' | 'video',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titleTR: initialData.titleTR || '',
        titleEN: initialData.titleEN || '',
        descriptionTR: initialData.descriptionTR || '',
        descriptionEN: initialData.descriptionEN || '',
        image: initialData.image || '',
        category: initialData.category || 'genel',
        active: initialData.active ?? true,
        youtubeUrl: initialData.youtubeId ? `https://www.youtube.com/watch?v=${initialData.youtubeId}` : '',
        videoUrl: initialData.videoUrl || '',
        type: initialData.type || 'image',
      });
      setImagePreview(initialData.image || null);
      
      // Video önizlemesini ayarla
      if (initialData.type === 'video' && initialData.videoUrl) {
        setVideoThumbnail(null); // VideoThumbGenerator tarafından oluşturulacak
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Video URL'si değiştiğinde thumbnail'i sıfırla
    if (name === 'videoUrl') {
      setVideoThumbnail(null);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Görsel önizleme
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Gerçek uygulamada burada dosya yükleme API'si çağrılır
    // Şimdilik sahte bir URL kullanıyoruz
    setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
  };
  
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya türünü kontrol et
    if (!file.type.startsWith('video/')) {
      toast.error('Lütfen geçerli bir video dosyası seçin');
      return;
    }
    
    // Video için bir geçici URL oluştur
    const videoUrl = URL.createObjectURL(file);
    
    // Form verilerini güncelle
    setFormData(prev => ({ 
      ...prev, 
      videoUrl, 
      type: 'video',
      youtubeUrl: '' // Video dosyası eklendiğinde YouTube URL'sini temizle
    }));
    
    // Önizlemeyi sıfırla (VideoThumbGenerator tarafından oluşturulacak)
    setVideoThumbnail(null);
  };

  const handleVideoThumbnailGenerated = (thumbnailUrl: string) => {
    setVideoThumbnail(thumbnailUrl);
  };
  
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.titleTR || 
        (formData.type === 'image' && !formData.image) ||
        (formData.type === 'video' && !formData.videoUrl && !formData.youtubeUrl)) {
      toast.error('Lütfen gerekli alanları doldurun (Başlık ve Görsel/Video)');
      return;
    }

    setLoading(true);

    try {
      // API isteği gelecekte eklenecek
      // Şimdilik başarılı olduğunu varsayalım
      
      toast.success(isEditing ? 'Galeri öğesi güncellendi' : 'Galeri öğesi eklendi');
      router.push('/admin/gallery');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlık (TR) *</label>
            <input
              type="text"
              name="titleTR"
              value={formData.titleTR}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlık (EN)</label>
            <input
              type="text"
              name="titleEN"
              value={formData.titleEN}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
            <textarea
              name="descriptionTR"
              value={formData.descriptionTR}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
            <textarea
              name="descriptionEN"
              value={formData.descriptionEN}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="genel">Genel</option>
              <option value="otel">Otel</option>
              <option value="odalar">Odalar</option>
              <option value="restoran">Restoran</option>
              <option value="spa">Spa</option>
              <option value="havuz">Havuz</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Medya Tipi</label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="image"
                  checked={formData.type === 'image'}
                  onChange={() => setFormData(prev => ({ ...prev, type: 'image' }))}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Resim</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="video"
                  checked={formData.type === 'video'}
                  onChange={() => setFormData(prev => ({ ...prev, type: 'video' }))}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Video</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Aktif</label>
          </div>
        </div>
        
        <div className="space-y-4">
          {formData.type === 'image' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Görsel *</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <FaUpload className="mr-2" />
                    Görsel Seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  {formData.image && (
                    <span className="text-sm text-gray-500">Görsel seçildi</span>
                  )}
                </div>
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                  <div className="relative h-64 w-full border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Önizleme"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/video.mp4"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <FaVideo className="mr-2" />
                    Video Seç
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Video önizleme */}
              {formData.videoUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Önizleme</label>
                  
                  {!isVideoPlaying ? (
                    <div className="relative border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      {/* VideoThumbGenerator ile thumbnail üret */}
                      {formData.videoUrl && !videoThumbnail && (
                        <VideoThumbGenerator 
                          videoUrl={formData.videoUrl} 
                          videoId={initialData?.id || 'new-video'} 
                          onThumbnailGenerated={handleVideoThumbnailGenerated}
                          showPreview={false}
                        />
                      )}
                      
                      <div className="aspect-video flex items-center justify-center cursor-pointer" onClick={toggleVideoPlay}>
                        {videoThumbnail ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={videoThumbnail} 
                              alt="Video önizleme" 
                              className="w-full h-full object-contain"
                              width={640}
                              height={360}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                              <div className="bg-red-600 rounded-full p-4 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300 shadow-lg">
                                <FaPlay size={24} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full p-6">
                            <div className="text-center">
                              <FaVideo className="mx-auto text-gray-400 mb-2" size={40} />
                              <p className="text-sm text-gray-500">Video önizlemesi yükleniyor...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-gray-300 rounded-md overflow-hidden">
                      <video 
                        ref={videoRef}
                        src={formData.videoUrl}
                        controls
                        className="w-full aspect-video"
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={() => setIsVideoPlaying(false)}
                      >
                        Tarayıcınız video etiketini desteklemiyor.
                      </video>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">YouTube Video URL&apos;si</label>
                <div className="mt-1 flex">
                  <div className="relative flex-grow flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaYoutube className="text-red-600" />
                    </div>
                    <input
                      type="text"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=VIDEOID"
                      className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Not: YouTube URL&apos;si eklerseniz, video URL&apos;si yerine bu kullanılacaktır.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Kaydet
            </>
          )}
        </button>
      </div>
    </form>
  );
} 
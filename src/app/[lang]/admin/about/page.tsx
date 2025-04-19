'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUpload, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default function AboutAdminPage({ params }: PageProps) {
  // Next.js 15'te params artık Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form durumları
  const [aboutData, setAboutData] = useState({
    titleTR: '',
    titleEN: '',
    subtitleTR: '',
    subtitleEN: '',
    contentTR: [] as string[],
    contentEN: [] as string[],
    badgesTR: [] as string[],
    badgesEN: [] as string[],
    imageUrl: ''
  });

  // Form içeriğini düzenleme state'leri
  const [formData, setFormData] = useState({
    titleTR: '',
    titleEN: '',
    subtitleTR: '',
    subtitleEN: '',
    contentTR: '',
    contentEN: '',
    badgesTR: '',
    badgesEN: '',
    imageUrl: ''
  });

  // API'den verileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/about', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Veri alınamadı');
        }
        
        const data = await response.json();
        
        // Form alanlarını doldur
        setAboutData({
          titleTR: data.titleTR || '',
          titleEN: data.titleEN || '',
          subtitleTR: data.subtitleTR || '',
          subtitleEN: data.subtitleEN || '',
          contentTR: data.contentTR || [],
          contentEN: data.contentEN || [],
          badgesTR: data.badgesTR || [],
          badgesEN: data.badgesEN || [],
          imageUrl: data.imageUrl || ''
        });
        
        setFormData({
          titleTR: data.titleTR || '',
          titleEN: data.titleEN || '',
          subtitleTR: data.subtitleTR || '',
          subtitleEN: data.subtitleEN || '',
          contentTR: Array.isArray(data.contentTR) ? data.contentTR.join('\n\n') : (data.contentTR || ''),
          contentEN: Array.isArray(data.contentEN) ? data.contentEN.join('\n\n') : (data.contentEN || ''),
          badgesTR: Array.isArray(data.badgesTR) ? data.badgesTR.join(', ') : (data.badgesTR || ''),
          badgesEN: Array.isArray(data.badgesEN) ? data.badgesEN.join(', ') : (data.badgesEN || ''),
          imageUrl: data.imageUrl || ''
        });
        
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        toast.error(lang === 'tr' ? 'Veriler yüklenemedi' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Form input değişiklikleri için handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Dosya yükleme işlemi
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      console.log('Dosya yükleniyor:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      // Önce about upload API'sini dene, hata verirse genel upload API'yi kullan
      let response;
      try {
        response = await fetch('/api/admin/about/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          console.log('About API başarısız, genel API deneniyor');
          throw new Error('About API başarısız');
        }
      } catch (err) {
        console.log('Alternatif API deneniyor');
        // Alternatif API'yi dene
        response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        console.error('Yükleme API yanıtı başarısız:', response.status);
        const errorText = await response.text();
        throw new Error(`Yükleme hatası: ${errorText}`);
      }

      const result = await response.json();
      console.log('Yükleme sonucu:', result);

      if (result.success) {
        // Yanıt formatı farklılıklarını ele al
        const imageUrl = result.url || result.filePath || '';
        
        if (!imageUrl) {
          throw new Error('Yükleme başarılı fakat resim URL bulunamadı');
        }
        
        // Form verisini güncelle
        setFormData(prevState => ({
          ...prevState, 
          imageUrl: imageUrl
        }));
        toast.success(lang === 'tr' ? 'Görsel başarıyla yüklendi!' : 'Image uploaded successfully!');
      } else {
        console.error('API başarılı yanıt vermedi:', result);
        toast.error(result.message || (lang === 'tr' ? 'Görsel yüklenemedi!' : 'Failed to upload image!'));
      }
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      toast.error(lang === 'tr' ? `Görsel yüklenirken bir hata oluştu: ${error.message}` : `An error occurred while uploading the image: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Değişiklikleri kaydet
  const handleSaveContent = async () => {
    if (!formData.titleTR || !formData.titleEN) {
      toast.error(lang === 'tr' ? 'Başlık alanları zorunludur' : 'Title fields are required');
      return;
    }

    setSaving(true);
    
    try {
      const contentTR = formData.contentTR.split('\n\n').filter(p => p.trim() !== '');
      const contentEN = formData.contentEN.split('\n\n').filter(p => p.trim() !== '');
      const badgesTR = formData.badgesTR.split(',').map(b => b.trim()).filter(b => b !== '');
      const badgesEN = formData.badgesEN.split(',').map(b => b.trim()).filter(b => b !== '');
      
      const updatedData = {
        titleTR: formData.titleTR,
        titleEN: formData.titleEN,
        subtitleTR: formData.subtitleTR || '',
        subtitleEN: formData.subtitleEN || '',
        contentTR,
        contentEN,
        badgesTR,
        badgesEN,
        imageUrl: formData.imageUrl || '',
        showOnHome: true,
        position: 1
      };
      
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Veri kaydedilemedi');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(lang === 'tr' ? 'Değişiklikler kaydedildi' : 'Changes saved successfully');
      } else {
        throw new Error(result.error || 'Veri kaydedilemedi');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error(lang === 'tr' ? 'Kaydetme sırasında hata oluştu' : 'Error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center text-xl font-semibold text-gray-700">
          {lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {lang === 'tr' ? 'Hakkımızda Sayfasını Düzenle' : 'Edit About Page'}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin`}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm"
              >
                <FaArrowLeft className="mr-2" />
                {lang === 'tr' ? 'Admin Panele Dön' : 'Back to Admin Panel'}
              </Link>
            </div>
          </div>

          {/* Görsel Yükleme Bölümü */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {lang === 'tr' ? 'Sayfa Görseli' : 'Page Image'}
              </h2>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                >
                  {isUploading ? (
                    <span>{lang === 'tr' ? 'Yükleniyor...' : 'Uploading...'}</span>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      <span>{lang === 'tr' ? 'Görsel Yükle' : 'Upload Image'}</span>
                    </>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Görsel Önizleme */}
            <div className="mt-4">
              {formData.imageUrl ? (
                <div className="relative w-full h-64 overflow-hidden rounded-lg border-2 border-gray-200">
                  <img 
                    src={formData.imageUrl} 
                    alt="Sayfa Görseli" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    {lang === 'tr' ? 'Henüz görsel yüklenmedi' : 'No image uploaded yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* İçerik Düzenleme Bölümü */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol Kolon - Türkçe */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {lang === 'tr' ? 'Türkçe İçerik' : 'Turkish Content'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titleTR">
                  {lang === 'tr' ? 'Başlık (TR)' : 'Title (TR)'}
                </label>
                <input
                  id="titleTR"
                  type="text"
                  name="titleTR"
                  value={formData.titleTR || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subtitleTR">
                  {lang === 'tr' ? 'Alt Başlık (TR)' : 'Subtitle (TR)'}
                </label>
                <input
                  id="subtitleTR"
                  type="text"
                  name="subtitleTR"
                  value={formData.subtitleTR || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contentTR">
                  {lang === 'tr' ? 'İçerik (TR)' : 'Content (TR)'}
                  <span className="text-gray-400 text-xs ml-2">{lang === 'tr' ? '(Paragraflar arasında boş satır bırakın)' : '(Leave empty line between paragraphs)'}</span>
                </label>
                <textarea
                  id="contentTR"
                  name="contentTR"
                  value={formData.contentTR || ''}
                  onChange={handleInputChange}
                  rows={8}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="badgesTR">
                  {lang === 'tr' ? 'Rozetler (TR)' : 'Badges (TR)'}
                  <span className="text-gray-400 text-xs ml-2">{lang === 'tr' ? '(Virgülle ayırın)' : '(Separate with commas)'}</span>
                </label>
                <input
                  id="badgesTR"
                  type="text"
                  name="badgesTR"
                  value={formData.badgesTR || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            {/* Sağ Kolon - İngilizce */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {lang === 'tr' ? 'İngilizce İçerik' : 'English Content'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titleEN">
                  {lang === 'tr' ? 'Başlık (EN)' : 'Title (EN)'}
                </label>
                <input
                  id="titleEN"
                  type="text"
                  name="titleEN"
                  value={formData.titleEN || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subtitleEN">
                  {lang === 'tr' ? 'Alt Başlık (EN)' : 'Subtitle (EN)'}
                </label>
                <input
                  id="subtitleEN"
                  type="text"
                  name="subtitleEN"
                  value={formData.subtitleEN || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contentEN">
                  {lang === 'tr' ? 'İçerik (EN)' : 'Content (EN)'}
                  <span className="text-gray-400 text-xs ml-2">{lang === 'tr' ? '(Paragraflar arasında boş satır bırakın)' : '(Leave empty line between paragraphs)'}</span>
                </label>
                <textarea
                  id="contentEN"
                  name="contentEN"
                  value={formData.contentEN || ''}
                  onChange={handleInputChange}
                  rows={8}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="badgesEN">
                  {lang === 'tr' ? 'Rozetler (EN)' : 'Badges (EN)'}
                  <span className="text-gray-400 text-xs ml-2">{lang === 'tr' ? '(Virgülle ayırın)' : '(Separate with commas)'}</span>
                </label>
                <input
                  id="badgesEN"
                  type="text"
                  name="badgesEN"
                  value={formData.badgesEN || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveContent}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-md flex items-center font-semibold"
            >
              {saving ? (
                <span>{lang === 'tr' ? 'Kaydediliyor...' : 'Saving...'}</span>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {lang === 'tr' ? 'Değişiklikleri Kaydet' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

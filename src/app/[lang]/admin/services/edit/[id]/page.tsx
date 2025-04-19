'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaPlusCircle } from 'react-icons/fa';
import AdminNavbar from '../../../../../components/AdminNavbar';
import { getIconOptions, getServiceById, updateServiceItem } from '../../../../../data/admin/servicesData';

type PageProps = {
  params: {
    lang: string;
    id: string;
  };
};

export default function EditServicePage({ params }: PageProps) {
  // Next.js 15'te params artık Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;
  const id = resolvedParams.id;
  
  const router = useRouter();
  const iconOptions = getIconOptions();

  const [formData, setFormData] = useState({
    titleTR: '',
    titleEN: '',
    descriptionTR: '',
    descriptionEN: '',
    detailsTR: [''],
    detailsEN: [''],
    image: '',
    images: [] as string[],
    icon: 'utensils',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Servis verilerini yükle
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setInitialLoading(true);
        const service = await getServiceById(id);
        
        if (!service) {
          throw new Error(lang === 'tr' ? 'Hizmet bulunamadı' : 'Service not found');
        }
        
        setFormData({
          titleTR: service.titleTR,
          titleEN: service.titleEN,
          descriptionTR: service.descriptionTR,
          descriptionEN: service.descriptionEN,
          detailsTR: service.detailsTR.length > 0 ? service.detailsTR : [''],
          detailsEN: service.detailsEN.length > 0 ? service.detailsEN : [''],
          image: service.image,
          images: service.images,
          icon: service.icon,
          active: service.active,
        });
        
      } catch (err: any) {
        setError(err.message || 'Hizmet verileri yüklenemedi');
        console.error('Hizmet verileri yükleme hatası:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchServiceData();
  }, [id, lang]);

  // Form alanları değiştiğinde state'i güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Checkbox değerlerini güncelle
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Detay öğeleri için işlevler
  const handleDetailChange = (lang: 'TR' | 'EN', index: number, value: string) => {
    const fieldName = `details${lang}` as 'detailsTR' | 'detailsEN';
    const updatedDetails = [...formData[fieldName]];
    updatedDetails[index] = value;
    
    setFormData({
      ...formData,
      [fieldName]: updatedDetails
    });
  };

  // Yeni detay ekleme
  const handleAddDetail = (lang: 'TR' | 'EN') => {
    const fieldName = `details${lang}` as 'detailsTR' | 'detailsEN';
    setFormData({
      ...formData,
      [fieldName]: [...formData[fieldName], '']
    });
  };

  // Detay silme
  const handleRemoveDetail = (lang: 'TR' | 'EN', index: number) => {
    const fieldName = `details${lang}` as 'detailsTR' | 'detailsEN';
    const updatedDetails = [...formData[fieldName]];
    updatedDetails.splice(index, 1);
    
    setFormData({
      ...formData,
      [fieldName]: updatedDetails
    });
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Boş detayları filtrele
      const filteredDetailsTR = formData.detailsTR.filter(d => d.trim() !== '');
      const filteredDetailsEN = formData.detailsEN.filter(d => d.trim() !== '');
      
      // Formun geçerliliğini kontrol et
      if (!formData.titleTR || !formData.titleEN) {
        throw new Error(lang === 'tr' ? 'Başlık alanları zorunludur' : 'Title fields are required');
      }
      
      // Servisi güncelle
      const updatedService = await updateServiceItem(id, {
        ...formData,
        detailsTR: filteredDetailsTR,
        detailsEN: filteredDetailsEN
      });
      
      if (updatedService) {
        setSuccess(lang === 'tr' ? 'Hizmet başarıyla güncellendi' : 'Service updated successfully');
        // 2 saniye sonra listeye geri dön
        setTimeout(() => {
          router.push(`/${lang}/admin/services`);
        }, 2000);
      } else {
        throw new Error(lang === 'tr' ? 'Hizmet güncellenirken bir hata oluştu' : 'Error while updating service');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Form gönderim hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar lang={lang} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar lang={lang} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {lang === 'tr' ? 'Hizmeti Düzenle' : 'Edit Service'}
            </h1>
            
            <button
              onClick={() => router.push(`/${lang}/admin/services`)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes />
              {lang === 'tr' ? 'İptal' : 'Cancel'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Aktif Durumu */}
                  <div className="sm:col-span-6">
                    <div className="flex items-center">
                      <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                        {lang === 'tr' ? 'Aktif (web sitesinde göster)' : 'Active (show on website)'}
                      </label>
                    </div>
                  </div>
                  
                  {/* Türkçe Başlık */}
                  <div className="sm:col-span-3">
                    <label htmlFor="titleTR" className="block text-sm font-medium text-gray-700">
                      {lang === 'tr' ? 'Başlık (Türkçe)' : 'Title (Turkish)'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="titleTR"
                        id="titleTR"
                        value={formData.titleTR}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* İngilizce Başlık */}
                  <div className="sm:col-span-3">
                    <label htmlFor="titleEN" className="block text-sm font-medium text-gray-700">
                      {lang === 'tr' ? 'Başlık (İngilizce)' : 'Title (English)'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="titleEN"
                        id="titleEN"
                        value={formData.titleEN}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* İkon */}
                  <div className="sm:col-span-2">
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                      {lang === 'tr' ? 'İkon' : 'Icon'}
                    </label>
                    <div className="mt-1">
                      <select
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-5 bg-gray-50 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {lang === 'tr' ? 'Açıklama' : 'Description'}
                </h3>
                
                {/* Türkçe Açıklama */}
                <div className="mt-4">
                  <label htmlFor="descriptionTR" className="block text-sm font-medium text-gray-700">
                    {lang === 'tr' ? 'Türkçe Açıklama' : 'Turkish Description'}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="descriptionTR"
                      name="descriptionTR"
                      rows={3}
                      value={formData.descriptionTR}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* İngilizce Açıklama */}
                <div className="mt-4">
                  <label htmlFor="descriptionEN" className="block text-sm font-medium text-gray-700">
                    {lang === 'tr' ? 'İngilizce Açıklama' : 'English Description'}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="descriptionEN"
                      name="descriptionEN"
                      rows={3}
                      value={formData.descriptionEN}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* Türkçe Detaylar */}
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {lang === 'tr' ? 'Hizmet Detayları (Türkçe)' : 'Service Details (Turkish)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddDetail('TR')}
                    className="flex items-center text-sm text-teal-600 hover:text-teal-900"
                  >
                    <FaPlusCircle className="mr-1" />
                    {lang === 'tr' ? 'Detay Ekle' : 'Add Detail'}
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.detailsTR.map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => handleDetailChange('TR', index, e.target.value)}
                        className="flex-1 shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={lang === 'tr' ? 'Hizmet detayı' : 'Service detail'}
                      />
                      {formData.detailsTR.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail('TR', index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* İngilizce Detaylar */}
              <div className="px-4 py-5 bg-gray-50 sm:px-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {lang === 'tr' ? 'Hizmet Detayları (İngilizce)' : 'Service Details (English)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddDetail('EN')}
                    className="flex items-center text-sm text-teal-600 hover:text-teal-900"
                  >
                    <FaPlusCircle className="mr-1" />
                    {lang === 'tr' ? 'Detay Ekle' : 'Add Detail'}
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.detailsEN.map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => handleDetailChange('EN', index, e.target.value)}
                        className="flex-1 shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={lang === 'tr' ? 'Hizmet detayı (İng)' : 'Service detail'}
                      />
                      {formData.detailsEN.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail('EN', index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {lang === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" />
                      {lang === 'tr' ? 'Kaydet' : 'Save'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 
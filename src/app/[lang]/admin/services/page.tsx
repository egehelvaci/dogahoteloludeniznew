'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, 
  FaPencilAlt, 
  FaTrash, 
  FaEye, 
  FaEyeSlash, 
  FaArrowUp, 
  FaArrowDown, 
  FaImage,
  FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  ServiceItem, 
  getAllServicesData, 
  deleteServiceItem, 
  toggleServiceVisibility, 
  reorderServices
} from '../../../data/admin/servicesData';
import useSocketNotifications from '../rooms/useSocketNotifications';
import AdminNavbar from '../../../components/AdminNavbar';

type PageProps = {
  params: {
    lang: string;
  };
};

export default function ServicesAdminPage({ params }: PageProps) {
  // Next.js 15'te params artık Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;
  
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // WebSocket bildirimlerini dinle
  const { needsRefresh, resetRefreshFlag } = useSocketNotifications('services');

  // Sayfa yüklendiğinde servisleri getir
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const data = await getAllServicesData();
      setServices(data);
    } catch (error) {
      console.error('Servis getirme hatası:', error);
      setError(lang === 'tr' ? 'Servisler yüklenirken bir hata oluştu' : 'Error loading services');
      toast.error(lang === 'tr' ? 'Servisler yüklenirken bir hata oluştu' : 'Error loading services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [lang]);
  
  // WebSocket bildirimi geldiğinde verileri yenile
  useEffect(() => {
    if (needsRefresh) {
      console.log('WebSocket bildirimi alındı, veriler yenileniyor...');
      fetchServices();
      resetRefreshFlag();
    }
  }, [needsRefresh]);

  // Servis görünürlüğünü değiştir
  const handleToggleVisibility = async (id: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const success = await toggleServiceVisibility(id);
      
      if (success) {
        // Durumu güncelle
        setServices(prevServices => prevServices.map(service => 
          service.id === id 
            ? { ...service, active: !service.active }
            : service
        ));
        
        toast.success(
          lang === 'tr' 
            ? 'Servis görünürlüğü güncellendi' 
            : 'Service visibility updated'
        );
      } else {
        toast.error(
          lang === 'tr' 
            ? 'Görünürlük değiştirilirken bir hata oluştu' 
            : 'Error updating visibility'
        );
      }
    } catch (err: any) {
      toast.error(err.message || (lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred'));
      console.error('Görünürlük değiştirme hatası:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Silme işlemi
  const handleDelete = async (id: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const success = await deleteServiceItem(id);
      
      if (success) {
        // Servisi listeden kaldır
        setServices(prevServices => prevServices.filter(service => service.id !== id));
        setConfirmDelete(null);
        
        toast.success(
          lang === 'tr' 
            ? 'Servis başarıyla silindi' 
            : 'Service deleted successfully'
        );
      } else {
        toast.error(
          lang === 'tr' 
            ? 'Servis silinirken bir hata oluştu' 
            : 'Error deleting service'
        );
      }
    } catch (err: any) {
      toast.error(err.message || (lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred'));
      console.error('Servis silme hatası:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Servisleri sırala (yukarı/aşağı)
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    if (isUpdating) return;
    
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) return;
    
    // İlk eleman yukarı çıkamaz, son eleman aşağı inemez
    if (
      (direction === 'up' && serviceIndex === 0) || 
      (direction === 'down' && serviceIndex === services.length - 1)
    ) {
      return;
    }
    
    const newServices = [...services];
    const targetIndex = direction === 'up' ? serviceIndex - 1 : serviceIndex + 1;
    
    // Sıraları değiştir
    const temp = newServices[serviceIndex].order;
    newServices[serviceIndex].order = newServices[targetIndex].order;
    newServices[targetIndex].order = temp;
    
    // Yer değiştir
    [newServices[serviceIndex], newServices[targetIndex]] = [newServices[targetIndex], newServices[serviceIndex]];
    
    // State'i güncelle
    setServices(newServices);
    
    // API'ye gönder
    const orderUpdates = newServices.map(service => ({
      id: service.id,
      order: service.order
    }));
    
    try {
      setIsUpdating(true);
      const success = await reorderServices(orderUpdates);
      
      if (success) {
        toast.success(
          lang === 'tr' 
            ? 'Sıralama güncellendi' 
            : 'Order updated successfully'
        );
      } else {
        throw new Error(lang === 'tr' ? 'Sıralama güncellenemedi' : 'Failed to update order');
      }
    } catch (err: any) {
      toast.error(err.message || (lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred'));
      console.error('Sıralama güncelleme hatası:', err);
      // Hata durumunda orijinal listeyi geri yükle
      fetchServices();
    } finally {
      setIsUpdating(false);
    }
  };

  // Yeni servis ekleme sayfasına git
  const handleAddService = () => {
    router.push(`/${lang}/admin/services/add`);
  };

  // Servis düzenleme sayfasına git
  const handleEditService = (id: string) => {
    router.push(`/${lang}/admin/services/edit/${id}`);
  };

  // Servis galeri sayfasına git
  const handleManageGallery = (id: string) => {
    router.push(`/${lang}/admin/services/gallery/${id}`);
  };

  // Düğme bileşenlerini oluşturan yardımcı fonksiyonlar
  const UpButton = ({ isDisabled, onClick, title }: { isDisabled: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isDisabled || isUpdating}
      className={`p-1 ${isDisabled || isUpdating ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-amber-700'}`}
      title={title}
    >
      <FaArrowUp size={14} />
    </button>
  );

  const DownButton = ({ isDisabled, onClick, title }: { isDisabled: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isDisabled || isUpdating}
      className={`p-1 ${isDisabled || isUpdating ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-amber-700'}`}
      title={title}
    >
      <FaArrowDown size={14} />
    </button>
  );

  const VisibilityButton = ({ isActive, onClick, title }: { isActive: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={`p-1 rounded ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${isActive ? 'text-green-600' : 'text-red-600'}`}
      title={title}
    >
      {isActive ? <FaEye /> : <FaEyeSlash />}
    </button>
  );

  const EditButton = ({ onClick, title }: { onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={`p-1 rounded text-amber-600 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      title={title}
    >
      <FaPencilAlt />
    </button>
  );

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
      <AdminNavbar lang={lang} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {lang === 'tr' ? 'Hizmetler Yönetimi' : 'Services Management'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/${lang}/admin`)}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm"
              >
                <FaArrowLeft className="mr-2" />
                {lang === 'tr' ? 'Admin Panele Dön' : 'Back to Admin Panel'}
              </button>
              <button
                onClick={handleAddService}
                className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-sm"
              >
                <FaPlus className="mr-2" />
                {lang === 'tr' ? 'Yeni Hizmet Ekle' : 'Add New Service'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Hizmetler Listesi */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">{lang === 'tr' ? 'Sıra' : 'Order'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Görsel' : 'Image'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'İkon' : 'Icon'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Başlık (TR)' : 'Title (TR)'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Başlık (EN)' : 'Title (EN)'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Durum' : 'Status'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'İşlemler' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">{service.order}</span>
                        <div className="flex flex-col">
                          <UpButton
                            isDisabled={index === 0}
                            onClick={() => handleReorder(service.id, 'up')}
                            title={lang === 'tr' ? 'Yukarı Taşı' : 'Move Up'}
                          />
                          <DownButton
                            isDisabled={index === services.length - 1}
                            onClick={() => handleReorder(service.id, 'down')}
                            title={lang === 'tr' ? 'Aşağı Taşı' : 'Move Down'}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative w-16 h-12 overflow-hidden rounded">
                        <img
                          src={service.image}
                          alt={service.titleTR}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-amber-500 text-xl">
                        <i className={`fa fa-${service.icon}`}></i>
                      </div>
                    </td>
                    <td className="p-3">{service.titleTR}</td>
                    <td className="p-3">{service.titleEN}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.active 
                          ? (lang === 'tr' ? 'Aktif' : 'Active') 
                          : (lang === 'tr' ? 'Gizli' : 'Hidden')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <VisibilityButton
                          isActive={service.active}
                          onClick={() => handleToggleVisibility(service.id)}
                          title={service.active 
                            ? (lang === 'tr' ? 'Gizle' : 'Hide') 
                            : (lang === 'tr' ? 'Göster' : 'Show')}
                        />
                        <button
                          onClick={() => handleManageGallery(service.id)}
                          className="p-1 rounded text-blue-600 hover:bg-gray-100"
                          title={lang === 'tr' ? 'Galeri Yönet' : 'Manage Gallery'}
                          disabled={isUpdating}
                        >
                          <FaImage />
                        </button>
                        <EditButton
                          onClick={() => handleEditService(service.id)}
                          title={lang === 'tr' ? 'Düzenle' : 'Edit'}
                        />
                        {confirmDelete === service.id ? (
                          <div className="flex items-center">
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                              disabled={isUpdating}
                            >
                              {lang === 'tr' ? 'Evet' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1 rounded bg-gray-600 text-white hover:bg-gray-700 ml-1"
                              disabled={isUpdating}
                            >
                              {lang === 'tr' ? 'Hayır' : 'No'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(service.id)}
                            className="p-1 rounded text-red-600 hover:bg-gray-100"
                            title={lang === 'tr' ? 'Sil' : 'Delete'}
                            disabled={isUpdating}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      {lang === 'tr' ? 'Henüz hiç hizmet eklenmemiş.' : 'No services added yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
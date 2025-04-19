'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaEdit, 
  FaEye, 
  FaEyeSlash, 
  FaArrowUp, 
  FaArrowDown,
  FaImages,
  FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { 
  getAllRoomsData, 
  RoomItem,
  toggleRoomVisibility,
  reorderRoomItems
} from '../../../data/admin/roomsData';
import useSocketNotifications from './useSocketNotifications';
import AdminLayout from '../../../components/AdminLayout';

interface AdminRoomsPageProps {
  params: {
    lang: string;
  };
}

export default function AdminRoomsPage({ params }: AdminRoomsPageProps) {
  // Next.js 15'te params Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;

  const [roomItems, setRoomItems] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoomItem | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  
  // WebSocket bildirimlerini dinle
  const { needsRefresh, resetRefreshFlag } = useSocketNotifications();

  // Oda verilerini yükle
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRoomsData();
      setRoomItems(data);
    } catch (error) {
      console.error('Oda verileri yüklenirken bir hata oluştu:', error);
      toast.error(lang === 'tr' ? 'Veriler yüklenirken bir hata oluştu' : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    loadRooms();
  }, [lang]);
  
  // WebSocket bildirimi geldiğinde verileri yenile
  useEffect(() => {
    if (needsRefresh) {
      console.log('WebSocket bildirimi alındı, veriler yenileniyor...');
      loadRooms();
      resetRefreshFlag();
    }
  }, [needsRefresh]);

  // Oda görünürlüğünü değiştir
  const handleToggleVisibility = async (id: string) => {
    try {
      const success = await toggleRoomVisibility(id);
      
      if (success) {
        // State'i güncelle
        setRoomItems(prev => prev.map(item => 
          item.id === id ? { ...item, active: !item.active } : item
        ));
        
        toast.success(lang === 'tr' ? 'Oda görünürlüğü güncellendi' : 'Room visibility updated');
      } else {
        throw new Error('Görünürlük değiştirilemedi');
      }
    } catch (error) {
      console.error('Görünürlük değiştirilirken hata:', error);
      toast.error(lang === 'tr' ? 'Görünürlük değiştirilirken hata oluştu' : 'Error updating visibility');
    }
  };

  // Sıralamayı değiştir
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = roomItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    const newItems = [...roomItems];
    
    if (direction === 'up' && currentIndex > 0) {
      // Öğeyi bir üste taşı
      [newItems[currentIndex], newItems[currentIndex - 1]] = 
        [newItems[currentIndex - 1], newItems[currentIndex]];
    } else if (direction === 'down' && currentIndex < newItems.length - 1) {
      // Öğeyi bir alta taşı
      [newItems[currentIndex], newItems[currentIndex + 1]] = 
        [newItems[currentIndex + 1], newItems[currentIndex]];
    }
    
    // Yeni sıra numaralarını güncelle
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setRoomItems(reorderedItems);
    
    // Veritabanına kaydet
    const orderData = reorderedItems.map(item => ({
      id: item.id,
      order: item.order
    }));
    
    try {
      const success = await reorderRoomItems(orderData);
      
      if (success) {
        toast.success(lang === 'tr' ? 'Sıralama güncellendi' : 'Order updated');
      } else {
        throw new Error('Sıralama güncellenemedi');
      }
    } catch (error) {
      console.error('Sıralama güncellenirken hata:', error);
      toast.error(lang === 'tr' ? 'Sıralama güncellenirken hata oluştu' : 'Error updating order');
      // Hata durumunda verileri yeniden yükle
      loadRooms();
    }
  };

  // Düzenleme sayfasına yönlendir
  const handleEditRoom = (id: string) => {
    window.location.href = `/${lang}/admin/rooms/edit/${id}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center text-xl font-semibold text-gray-700">
          {lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}
        </div>
      </AdminLayout>
    );
  }

  // Düğme bileşenlerini oluşturan yardımcı fonksiyonlar
  const UpButton = ({ isDisabled, onClick, title }: { isDisabled: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`p-1 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-teal-700'}`}
      title={title}
    >
      <FaArrowUp size={12} />
    </button>
  );

  const DownButton = ({ isDisabled, onClick, title }: { isDisabled: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`p-1 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-teal-700'}`}
      title={title}
    >
      <FaArrowDown size={12} />
    </button>
  );

  const VisibilityButton = ({ isActive, onClick, title }: { isActive: boolean, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'text-green-600' : 'text-red-600'}`}
      title={title}
    >
      {isActive ? <FaEye /> : <FaEyeSlash />}
    </button>
  );

  const EditButton = ({ onClick, title }: { onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      className="p-1 rounded text-teal-600 hover:bg-gray-100"
      title={title}
    >
      <FaEdit />
    </button>
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {lang === 'tr' ? 'Odalar Yönetimi' : 'Rooms Management'}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/admin`}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm"
              >
                <FaArrowLeft className="mr-2" />
                {lang === 'tr' ? 'Admin Panele Dön' : 'Back to Admin Panel'}
              </Link>
              <div className="text-gray-600 italic text-sm">
                {lang === 'tr' ? 'Mevcut oda türleri düzenlenebilir' : 'Existing room types can be edited'}
              </div>
            </div>
          </div>
          
          {/* Odalar Listesi */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">{lang === 'tr' ? 'Sıra' : 'Order'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Görsel' : 'Image'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Oda Adı (TR)' : 'Room Name (TR)'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Oda Adı (EN)' : 'Room Name (EN)'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Kapasite' : 'Capacity'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'Durum' : 'Status'}</th>
                  <th className="p-2 text-left">{lang === 'tr' ? 'İşlemler' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {roomItems.map((room, index) => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">{room.order}</span>
                        <div className="flex flex-col">
                          <UpButton
                            isDisabled={index === 0}
                            onClick={() => handleReorder(room.id, 'up')}
                            title={lang === 'tr' ? 'Yukarı Taşı' : 'Move Up'}
                          />
                          <DownButton
                            isDisabled={index === roomItems.length - 1}
                            onClick={() => handleReorder(room.id, 'down')}
                            title={lang === 'tr' ? 'Aşağı Taşı' : 'Move Down'}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative w-16 h-12 overflow-hidden rounded">
                        <img
                          src={room.image}
                          alt={room.nameTR}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3">{room.nameTR}</td>
                    <td className="p-3">{room.nameEN}</td>
                    <td className="p-3 text-center">{room.capacity}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.active 
                          ? (lang === 'tr' ? 'Aktif' : 'Active') 
                          : (lang === 'tr' ? 'Gizli' : 'Hidden')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <VisibilityButton
                          isActive={room.active}
                          onClick={() => handleToggleVisibility(room.id)}
                          title={room.active 
                            ? (lang === 'tr' ? 'Gizle' : 'Hide') 
                            : (lang === 'tr' ? 'Göster' : 'Show')}
                        />
                        <Link
                          href={`/${lang}/admin/rooms/gallery/${room.id}`}
                          className="p-1 rounded text-blue-600 hover:bg-gray-100"
                          title={lang === 'tr' ? 'Galeri Yönet' : 'Manage Gallery'}
                        >
                          <FaImages />
                        </Link>
                        <EditButton
                          onClick={() => handleEditRoom(room.id)}
                          title={lang === 'tr' ? 'Düzenle' : 'Edit'}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {roomItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      {lang === 'tr' ? 'Henüz hiç oda eklenmemiş.' : 'No rooms added yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 
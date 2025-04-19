'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEdit, FaTrashAlt, FaPlus, FaArrowUp, FaArrowDown, FaGripLines, FaImage, FaVideo, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MediaUploader from '../../../../components/ui/MediaUploader';
import AdminLayout from "../../../components/AdminLayout";

interface GalleryItem {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  orderNumber: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
}

interface GalleryAdminClientProps {
  lang: string;
}

export default function GalleryAdminClient({ lang }: GalleryAdminClientProps) {
  const router = useRouter();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Galeri öğelerini getir
  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching gallery items...');
      const response = await fetch('/api/admin/gallery');
      
      if (!response.ok) {
        throw new Error(`Galeri öğeleri yüklenirken hata: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received gallery data:', data);
      
      if (data.success && Array.isArray(data.items)) {
        // Verileri filtrele ve null/undefined değerleri düzelt
        const validItems = data.items
          .filter((item: any) => item && item.id) // Sadece geçerli öğeleri al
          .map((item: GalleryItem) => ({
            ...item,
            imageUrl: item.imageUrl || null,
            videoUrl: item.videoUrl || null,
            type: item.type || (item.videoUrl ? 'video' : 'image'),
            orderNumber: item.orderNumber || 0
          }));
        
        // Verileri sıralama numarasına göre sırala
        const sortedItems = validItems.sort((a: GalleryItem, b: GalleryItem) => 
          a.orderNumber - b.orderNumber
        );
        
        console.log('Processed gallery items:', sortedItems);
        setGalleryItems(sortedItems);
      } else {
        throw new Error(data.message || 'Galeri verileri alınamadı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Galeri öğeleri yüklenirken bir hata oluştu');
      console.error('Galeri yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // MediaUploader için callback
  const handleMediaUpload = useCallback(
    async (result: { url: string; fileId: string; fileType: string }) => {
      try {
        console.log('Medya yükleme geri çağrısı alındı:', result);
        
        if (!result.url) {
          const errorMessage = lang === 'tr' 
            ? 'Geçerli bir medya URL\'si bulunamadı' 
            : 'Valid media URL not found';
          setError(errorMessage);
          return;
        }
        
        setAddingItem(true);
        setError(null);
        
        // Dosya tipini doğru şekilde belirle
        // fileType değerini kontrol et (MediaUploader'dan gelen)
        const isVideoType = result.fileType && 
          (result.fileType === 'video' || 
           result.fileType.includes('video') || 
           result.url.match(/\.(mp4|webm|ogg|mov)$/i));
        
        // API'ye gönderilecek verileri hazırla
        const itemData = {
          type: isVideoType ? 'video' : 'image',
          imageUrl: isVideoType ? null : result.url,
          videoUrl: isVideoType ? result.url : null
        };
        
        console.log('API\'ye gönderilen veri:', itemData);
        
        // API isteği
        const response = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
          throw new Error(`API hatası: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('API yanıtı:', responseData);
        
        setUploadSuccess(true);
        fetchGalleryItems();
        setTimeout(() => {
          setUploadSuccess(false);
          setShowAddForm(false);
        }, 2000);
      } catch (error) {
        console.error('Medya yükleme hatası:', error);
        setError(error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu');
      } finally {
        setAddingItem(false);
      }
    },
    [lang, fetchGalleryItems]
  );

  // Silme onayı modal'ı
  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Öğe silme işlemi
  const deleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/gallery/${itemToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Silme işlemi başarısız');
      }
      
      // Öğeyi yerel durumdan kaldır
      setGalleryItems(prev => prev.filter(item => item.id !== itemToDelete));
      closeDeleteModal();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi sırasında bir hata oluştu');
      console.error('Galeri öğesi silme hatası:', err);
      closeDeleteModal();
    }
  };

  // Sıralama için drag-drop işleyicisi
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(galleryItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // State'i güncelle
    setGalleryItems(items);
    
    // Yeni sıralamayı sunucuya kaydet
    try {
      const reorderedItems = items.map((item, index) => ({
        id: item.id,
        orderNumber: index + 1
      }));
      
      const response = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: reorderedItems })
      });
      
      if (!response.ok) {
        throw new Error('Sıralama güncellenirken bir hata oluştu');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıralama sırasında bir hata oluştu');
      console.error('Yeniden sıralama hatası:', err);
      
      // Hata durumunda orijinal sıralamayı geri getir
      fetchGalleryItems();
    }
  };

  // Video önizlemesini göster
  const renderVideoThumbnail = (item: GalleryItem) => (
    <div className="relative w-20 h-16 rounded overflow-hidden bg-gray-200">
      <img 
        src={item.imageUrl || "/images/gallery/video-preview.jpg"} 
        alt="Video önizleme" 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log("Video thumbnail yüklenemedi, varsayılan kullanılıyor");
          (e.target as HTMLImageElement).src = "/images/gallery/video-preview.jpg";
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <FaVideo className="text-white text-base" />
      </div>
    </div>
  );

  // Görsel önizlemesini göster
  const renderImageThumbnail = (item: GalleryItem) => (
    <div className="relative w-20 h-16 rounded overflow-hidden bg-gray-200">
      <img 
        src={item.imageUrl || '/images/placeholder.jpg'} 
        alt="Galeri görseli" 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log("Görsel yüklenemedi, varsayılan kullanılıyor");
          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
        }}
      />
    </div>
  );

  // Galeri öğesi gösterimi
  const renderGalleryItem = (item: GalleryItem, index: number) => {
    // Video öğesi ise
    if (item.type === 'video' || item.videoUrl) {
      return (
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
          {/* Video önizleme görüntüsü */}
          <div className="w-full h-40 md:h-44 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
              <img
                src={item.imageUrl || "/images/gallery/video-preview.jpg"}
                alt={`Video ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/gallery/video-preview.jpg";
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-teal-600 bg-opacity-90 rounded-full flex items-center justify-center text-white">
                <FaVideo className="text-lg" />
              </div>
            </div>
          </div>
          
          {/* Öğe bilgileri */}
          <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <p className="font-medium text-gray-900 mb-1 truncate">
                {item.title || `Video ${index + 1}`}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* İşlem butonları */}
            <div className="mt-2 flex justify-between">
              <button
                onClick={() => handleEditItem(item)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FaEdit className="mr-1" /> {lang === 'tr' ? 'Düzenle' : 'Edit'}
              </button>
              <button
                onClick={() => openDeleteModal(item.id)}
                className="text-red-600 hover:text-red-800 text-sm flex items-center"
              >
                <FaTrashAlt className="mr-1" /> {lang === 'tr' ? 'Sil' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Görsel öğesi ise
    return (
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        {/* Görsel önizleme */}
        <div className="w-full h-40 md:h-44 bg-gray-200 relative">
          {item.type === 'image' ? (
            <div className="relative w-20 h-16 rounded overflow-hidden bg-gray-200">
              <img 
                src={item.imageUrl || '/images/placeholder.jpg'} 
                alt="Galeri görseli"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
            </div>
          ) : (
            <div className="relative w-20 h-16 rounded overflow-hidden bg-gray-200">
              <img 
                src={item.imageUrl || "/images/gallery/video-preview.jpg"} 
                alt="Video önizleme"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/gallery/video-preview.jpg";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <FaVideo className="text-white text-base" />
              </div>
            </div>
          )}
        </div>
        
        {/* Öğe bilgileri */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <p className="font-medium text-gray-900 mb-1 truncate">
              {item.title || `Görsel ${index + 1}`}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* İşlem butonları */}
          <div className="mt-2 flex justify-between">
            <button
              onClick={() => handleEditItem(item)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FaEdit className="mr-1" /> {lang === 'tr' ? 'Düzenle' : 'Edit'}
            </button>
            <button
              onClick={() => openDeleteModal(item.id)}
              className="text-red-600 hover:text-red-800 text-sm flex items-center"
            >
              <FaTrashAlt className="mr-1" /> {lang === 'tr' ? 'Sil' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Kullanıcı arayüzü
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {lang === 'tr' ? 'Galeri Yönetimi' : 'Gallery Management'}
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            {lang === 'tr' ? 'Yeni Ekle' : 'Add New'}
          </button>
        </div>
        
        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        {/* Yükleme başarılı mesajı */}
        {uploadSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <FaCheck className="mr-2" />
            {lang === 'tr' ? 'Medya başarıyla yüklendi!' : 'Media uploaded successfully!'}
          </div>
        )}
        
        {/* Yeni ekle formu */}
        {showAddForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {lang === 'tr' ? 'Yeni Medya Ekle' : 'Add New Media'}
            </h2>
            
            <div className="mb-6">
              <MediaUploader
                onUpload={handleMediaUpload}
                type="any"
                folder="gallery"
                label={lang === 'tr' ? 'Görsel veya Video Yükle' : 'Upload Image or Video'}
                maxSizeMB={50}
                apiEndpoint="/api/upload"
              />
            </div>
            
            {addingItem && (
              <div className="flex items-center text-blue-600">
                <FaSpinner className="animate-spin mr-2" />
                {lang === 'tr' ? 'Ekleniyor...' : 'Adding...'}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors mr-2"
                disabled={addingItem}
              >
                {lang === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
        
        {/* Yükleme göstergesi */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-teal-600 text-4xl" />
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md text-yellow-800 text-center">
            {lang === 'tr' ? 'Henüz galeri öğesi eklenmemiş.' : 'No gallery items added yet.'}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="galleryItems">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white shadow-md rounded-md overflow-hidden"
                >
                  {/* Tablo başlığı */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">{lang === 'tr' ? 'Görsel/Video' : 'Image/Video'}</div>
                    <div className="col-span-2">{lang === 'tr' ? 'Tür' : 'Type'}</div>
                    <div className="col-span-3">{lang === 'tr' ? 'Tarih' : 'Date'}</div>
                    <div className="col-span-4 text-right">{lang === 'tr' ? 'İşlemler' : 'Actions'}</div>
                  </div>
                  
                  {/* Galeri öğeleri listesi */}
                  {galleryItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 items-center"
                        >
                          {/* Sıra numarası ve sürükleme tutacağı */}
                          <div className="col-span-1 flex items-center">
                            <div {...provided.dragHandleProps} className="cursor-grab mr-2">
                              <FaGripLines className="text-gray-400" />
                            </div>
                            <span>{item.orderNumber}</span>
                          </div>
                          
                          {/* Görsel önizleme */}
                          <div className="col-span-2">
                            {item.type === 'video' || item.videoUrl 
                              ? renderVideoThumbnail(item)
                              : renderImageThumbnail(item)
                            }
                          </div>
                          
                          {/* Tür */}
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.type === 'image' 
                                ? (lang === 'tr' ? 'Görsel' : 'Image') 
                                : (lang === 'tr' ? 'Video' : 'Video')}
                            </span>
                          </div>
                          
                          {/* Tarih */}
                          <div className="col-span-3 text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString(
                              lang === 'tr' ? 'tr-TR' : 'en-US',
                              { year: 'numeric', month: 'short', day: 'numeric' }
                            )}
                          </div>
                          
                          {/* İşlemler */}
                          <div className="col-span-4 flex justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/${lang}/admin/gallery/add`)}
                              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                              title={lang === 'tr' ? 'Düzenle' : 'Edit'}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id)}
                              className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title={lang === 'tr' ? 'Sil' : 'Delete'}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        
        {/* Silme onayı modal'ı */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-medium mb-4">
                {lang === 'tr' ? 'Öğeyi silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this item?'}
              </h3>
              <p className="mb-4 text-gray-600">
                {lang === 'tr' 
                  ? 'Bu işlem geri alınamaz ve öğe kalıcı olarak silinecektir.' 
                  : 'This action cannot be undone and the item will be permanently deleted.'}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                >
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  onClick={deleteItem}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {lang === 'tr' ? 'Evet, Sil' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { getAllGalleryItems, GalleryItem } from '../../data/gallery';
import { GalleryItem } from '../../data/gallery'; // Keep type import if needed elsewhere or define locally
import Image from 'next/image';
import { FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminHeader from '../../components/admin/AdminHeader';

export default function GalleryAdminPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setIsLoading(true);
      // Fetch data from the API route
      const response = await fetch('/api/admin/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      if (data.success) {
        setGalleryItems(data.items);
      } else {
        throw new Error(data.message || 'Failed to fetch gallery items');
      }
    } catch (error) {
      toast.error('Galeri öğeleri yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
      try {
        // API isteği gelecekte eklenecek
        toast.success('Öğe başarıyla silindi');
        // Silme işleminden sonra listeyi güncelle
        setGalleryItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        toast.error('Öğe silinirken bir hata oluştu');
        console.error(error);
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/gallery/edit/${id}`);
  };

  const handleAdd = () => {
    router.push('/admin/gallery/new');
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = galleryItems.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === galleryItems.length - 1)
    ) {
      return;
    }

    const newItems = [...galleryItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap items
    [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
    
    // Update order values
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });
    
    setGalleryItems(newItems);
    
    try {
      // API isteği gelecekte eklenecek
      toast.success('Sıralama başarıyla güncellendi');
    } catch (error) {
      toast.error('Sıralama güncellenirken bir hata oluştu');
      console.error(error);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const updatedItems = galleryItems.map(item => {
        if (item.id === id) {
          return { ...item, active: !item.active };
        }
        return item;
      });
      
      setGalleryItems(updatedItems);
      // API isteği gelecekte eklenecek
      toast.success('Durum başarıyla güncellendi');
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader title="Galeri Yönetimi" />
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Galeri Öğeleri</h1>
        <button 
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Yeni Ekle
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıralama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {galleryItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-16 w-24 relative">
                    <Image
                      src={item.image}
                      alt={item.titleTR}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.titleTR}</div>
                  <div className="text-gray-500 text-sm">{item.titleEN}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(item.id)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReorder(item.id, 'up')}
                      disabled={galleryItems.indexOf(item) === 0}
                      className={`p-1 rounded ${
                        galleryItems.indexOf(item) === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => handleReorder(item.id, 'down')}
                      disabled={galleryItems.indexOf(item) === galleryItems.length - 1}
                      className={`p-1 rounded ${
                        galleryItems.indexOf(item) === galleryItems.length - 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

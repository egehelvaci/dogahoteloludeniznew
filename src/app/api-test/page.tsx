'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ApiTest = () => {
  const [activeTab, setActiveTab] = useState('slider');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    titleTR: '',
    titleEN: '',
    descriptionTR: '',
    descriptionEN: '',
    image: '/images/slider1.jpg',
    videoUrl: '',
    order: 0,
    active: true
  });

  const [testItems, setTestItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const apiEndpoints = {
    slider: {
      getAll: '/api/slider',
      create: '/api/slider',
      update: '/api/slider',
      delete: '/api/slider',
      reorder: '/api/slider/reorder'
    },
    gallery: {
      getAll: '/api/gallery',
      create: '/api/gallery',
      update: '/api/gallery',
      delete: '/api/gallery',
      reorder: '/api/gallery/reorder'
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiEndpoints[activeTab].getAll);
      if (!response.ok) {
        throw new Error(`API yanıtı başarısız: ${response.status}`);
      }
      const data = await response.json();
      setTestItems(data);
      setResults(data);
    } catch (err) {
      setError(`Veri yüklenirken hata oluştu: ${err.message}`);
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResults(null);
    setSelectedItem(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      titleTR: '',
      titleEN: '',
      descriptionTR: '',
      descriptionEN: '',
      image: '/images/slider1.jpg',
      videoUrl: '',
      order: 0,
      active: true
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiEndpoints[activeTab].create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: uuidv4()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API yanıtı başarısız: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      await loadData(); // Listeyi güncelle
      resetForm();
    } catch (err) {
      setError(`Oluşturma sırasında hata: ${err.message}`);
      console.error('Oluşturma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) {
      setError('Güncellenecek öğe seçilmedi');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiEndpoints[activeTab].update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: selectedItem
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API yanıtı başarısız: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      await loadData(); // Listeyi güncelle
      resetForm();
      setSelectedItem(null);
    } catch (err) {
      setError(`Güncelleme sırasında hata: ${err.message}`);
      console.error('Güncelleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) {
      setError('Silinecek öğe seçilmedi');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiEndpoints[activeTab].delete}?id=${selectedItem}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API yanıtı başarısız: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      await loadData(); // Listeyi güncelle
      resetForm();
      setSelectedItem(null);
    } catch (err) {
      setError(`Silme sırasında hata: ${err.message}`);
      console.error('Silme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    if (testItems.length < 2) {
      setError('Yeniden sıralamak için en az 2 öğe gerekli');
      return;
    }
    
    // Rastgele sıralama yapalım
    const shuffledItems = [...testItems]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: item.id,
        order: index + 1
      }));
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiEndpoints[activeTab].reorder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: shuffledItems
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API yanıtı başarısız: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      await loadData(); // Listeyi güncelle
    } catch (err) {
      setError(`Yeniden sıralama sırasında hata: ${err.message}`);
      console.error('Yeniden sıralama hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item.id);
    const fieldMapping = {
      titleTR: item.titleTR,
      titleEN: item.titleEN,
      descriptionTR: item.descriptionTR || item.description,
      descriptionEN: item.descriptionEN,
      image: item.image || item.imageUrl,
      videoUrl: item.videoUrl,
      order: item.order || item.orderNumber,
      active: item.active
    };

    setFormData({
      id: item.id,
      ...fieldMapping
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const renderForm = () => (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium">
        {selectedItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Başlık (TR)</label>
          <input
            type="text"
            name="titleTR"
            value={formData.titleTR}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Başlık (EN)</label>
          <input
            type="text"
            name="titleEN"
            value={formData.titleEN}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
          <textarea
            name="descriptionTR"
            value={formData.descriptionTR}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
          <textarea
            name="descriptionEN"
            value={formData.descriptionEN}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Görsel URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Video URL</label>
          <input
            type="text"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Sıra</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-indigo-600"
          />
          <label className="ml-2 block text-sm text-gray-700">Aktif</label>
        </div>
      </div>
      
      <div className="flex space-x-4 mt-4">
        {selectedItem ? (
          <>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Güncelle
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Sil
            </button>
            <button
              onClick={() => { setSelectedItem(null); resetForm(); }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              İptal
            </button>
          </>
        ) : (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Ekle
          </button>
        )}
      </div>
    </div>
  );

  const renderItemsList = () => (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Mevcut Öğeler</h2>
        <div className="space-x-2">
          <button
            onClick={loadData}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            Yenile
          </button>
          <button
            onClick={handleReorder}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
          >
            Yeniden Sırala
          </button>
        </div>
      </div>
      
      {testItems.length === 0 ? (
        <p className="text-gray-500">Herhangi bir öğe bulunamadı</p>
      ) : (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testItems.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-100 ${selectedItem === item.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                    {item.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.titleTR || item.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 overflow-hidden bg-gray-200 rounded">
                      {item.image || item.imageUrl ? (
                        <img 
                          src={item.image || item.imageUrl} 
                          alt={item.titleTR || item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs p-2">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.order || item.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectItem(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!results) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h2 className="text-lg font-medium mb-2">API Yanıtı</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">API Test Sayfası</h1>
      
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleTabChange('slider')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'slider'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Slider API
            </button>
            <button
              onClick={() => handleTabChange('gallery')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'gallery'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Galeri API
            </button>
          </nav>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {renderForm()}
          {renderResults()}
        </div>
        <div>
          {renderItemsList()}
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 
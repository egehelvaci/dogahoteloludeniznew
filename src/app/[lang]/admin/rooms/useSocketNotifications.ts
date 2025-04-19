'use client';

import { useState, useEffect } from 'react';

/**
 * WebSocket bildirimlerini dinleyen hook
 * @param topic Dinlenecek bildirim konusu (rooms, services, gallery veya all)
 * @returns Yenileme gerektiren durumu izlemek için değerler
 */
export default function useSocketNotifications(topic: string = 'all') {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [lastEvent, setLastEvent] = useState<{type: string, data: any} | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connectSSE = () => {
      // Önceki bağlantıyı kapat
      if (eventSource) {
        eventSource.close();
      }
      
      // Server-Sent Events bağlantısı kur
      const baseUrl = window.location.origin;
      eventSource = new EventSource(`${baseUrl}/api/websocket?topic=${topic}`);
      
      // Bağlantı açıldığında
      eventSource.onopen = () => {
        console.log('WebSocket bağlantısı açıldı');
      };
      
      // Genel mesajlar
      eventSource.onmessage = (event) => {
        if (event.data === 'ping') return; // Ping mesajlarını atla
        
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket bildirimi alındı:', data);
          
          // Olaya göre işlem yap
          if (data.event) {
            setLastEvent({
              type: data.event,
              data: data.data || {}
            });
            
            // Yenileme gerektiren olaylar
            const refreshEvents = [
              'roomsUpdated', 'roomUpdated', 
              'servicesUpdated', 'serviceUpdated',
              'galleryUpdated'
            ];
            
            if (refreshEvents.includes(data.event)) {
              setNeedsRefresh(true);
            }
          }
        } catch (error) {
          console.error('WebSocket mesajı işlenirken hata:', error);
        }
      };
      
      // Hata durumunda
      eventSource.onerror = (error) => {
        console.error('WebSocket bağlantı hatası:', error);
        
        // Bağlantıyı kapat ve yeniden bağlanmayı dene
        if (eventSource) {
          eventSource.close();
          eventSource = null;
          
          // 5 saniye sonra yeniden bağlan
          setTimeout(connectSSE, 5000);
        }
      };
    };
    
    // Tarayıcı tarafında çalıştığından emin ol
    if (typeof window !== 'undefined') {
      connectSSE();
    }
    
    // Temizleme fonksiyonu
    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [topic]);
  
  /**
   * Yenileme bayrağını sıfırla
   */
  const resetRefreshFlag = () => {
    setNeedsRefresh(false);
  };
  
  return {
    needsRefresh,
    lastEvent,
    resetRefreshFlag
  };
} 
import { Server, Socket } from 'socket.io'; // Import Socket type
import http from 'http';
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage } from 'http';

// WebSocket sunucusu (Use Server type)
let io: Server | null = null;

// Aktif istemcileri tutacağımız dizi
const clients: {
  id: string;
  res: any;
  topic: string;
}[] = [];

// WebSocket bağlantı işleyicisi (Remove unused req)
export function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get('topic') || 'all';
  const clientId = Math.random().toString(36).substring(2, 15);

  // Server-Sent Events (SSE) için yanıt başlıkları
  const response = new NextResponse(new ReadableStream({
    start(controller) {
      // Yeni istemci ekle
      clients.push({
        id: clientId,
        res: controller,
        topic
      });

      // Bağlantıyı açık tutmak için düzenli ping gönderimi
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue('data: ping\n\n');
        } catch (e) {
          // İstemci bağlantıyı kapattıysa
          clearInterval(pingInterval);
          clients.splice(clients.findIndex(client => client.id === clientId), 1);
        }
      }, 30000);

      // İstemciye bağlantı kurulduğunu bildir
      controller.enqueue('data: {"event":"connected","clientId":"' + clientId + '"}\n\n');
    },
    cancel() {
      // İstemciyi kaldır
      const index = clients.findIndex(client => client.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    },
  }), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });

  return response;
}

// Odalar güncellendiğinde istemcilere bildir
export function notifyRoomsUpdated(data?: any) {
  broadcastToTopic('rooms', JSON.stringify({
    event: 'roomsUpdated',
    data: data || { timestamp: Date.now() }
  }));
}

// Servisler güncellendiğinde istemcilere bildir
export function notifyServicesUpdated(data?: any) {
  broadcastToTopic('services', JSON.stringify({
    event: 'servicesUpdated',
    data: data || { timestamp: Date.now() }
  }));
}

// Galeri güncellendiğinde istemcilere bildir
export function notifyGalleryUpdated(data?: any) {
  broadcastToTopic('gallery', JSON.stringify({
    event: 'galleryUpdated',
    data: data || { timestamp: Date.now() }
  }));
}

// Tüm istemcilere mesaj gönder
export function broadcastToAll(message: string) {
  clients.forEach(client => {
    try {
      client.res.enqueue(`data: ${message}\n\n`);
    } catch (e) {
      // Bu istemci artık mevcut değil, siliyoruz
      clients.splice(clients.indexOf(client), 1);
    }
  });
}

// Belirli bir konuyu dinleyen istemcilere mesaj gönder
export function broadcastToTopic(topic: string, message: string) {
  // Hem ilgili konuyu hem de 'all' konusunu dinleyen istemcilere gönder
  clients.forEach(client => {
    if (client.topic === topic || client.topic === 'all') {
      try {
        client.res.enqueue(`data: ${message}\n\n`);
      } catch (e) {
        // Bu istemci artık mevcut değil, siliyoruz
        clients.splice(clients.indexOf(client), 1);
      }
    }
  });
}

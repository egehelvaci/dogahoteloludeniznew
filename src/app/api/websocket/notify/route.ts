import { NextRequest, NextResponse } from 'next/server';
import { notifyRoomsUpdated, notifyServicesUpdated, notifyGalleryUpdated } from '../route';

export async function POST(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get('topic') || 'all';
    const data = await req.json();
    
    switch(topic) {
      case 'rooms':
        notifyRoomsUpdated(data);
        break;
      case 'services':
        notifyServicesUpdated(data);
        break;
      case 'gallery':
        notifyGalleryUpdated(data);
        break;
      case 'all':
        notifyRoomsUpdated(data);
        notifyServicesUpdated(data);
        notifyGalleryUpdated(data);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Geçersiz bildirim konusu' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `${topic} için bildirim gönderildi`
    });
  } catch (error) {
    console.error('Bildirim gönderilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Bildirim gönderilemedi' },
      { status: 500 }
    );
  }
} 
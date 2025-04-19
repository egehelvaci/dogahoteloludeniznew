import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { notifyGalleryUpdated } from '../../websocket/route';

export const dynamic = 'force-dynamic';

// POST: Galeri öğelerini yeniden sıralama
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz istek formatı' },
        { status: 400 }
      );
    }
    
    // Tüm güncellemeleri paralel olarak yap
    await Promise.all(
      body.items.map((item: { id: string; orderNumber: number }) =>
        prisma.gallery.update({
          where: { id: item.id },
          data: { orderNumber: item.orderNumber },
        })
      )
    );
    
    // WebSocket bildirimi gönder
    notifyGalleryUpdated();
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğeleri başarıyla yeniden sıralandı',
    });
  } catch (error) {
    console.error('Galeri öğeleri yeniden sıralanırken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğeleri yeniden sıralanırken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

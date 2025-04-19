import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST - Galeri öğelerinin sıralamasını güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: 'Sıralanacak öğeler bulunamadı veya geçersiz format' },
        { status: 400 }
      );
    }
    
    // Paralel işlemler için Promise.all kullanıyoruz
    const updates = body.items.map((item: { id: string; orderNumber: number }) => {
      return prisma.gallery.update({
        where: { id: item.id },
        data: { orderNumber: item.orderNumber }
      });
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğelerinin sıralaması başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Sıralama güncellenirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Sıralama güncellenirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

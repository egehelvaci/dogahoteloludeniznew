import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { items } = await request.json();
    
    console.log('Slider yeniden sıralama isteği alındı:', items);
    
    if (!Array.isArray(items)) {
      console.error('Geçersiz veri formatı: items bir dizi değil');
      return NextResponse.json(
        { success: false, message: 'Yeniden sıralanacak öğeler dizisi gereklidir' },
        { status: 400 }
      );
    }
    
    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.id || item.order === undefined) {
          throw new Error('Her öğenin id ve order alanları olmalıdır');
        }
        
        console.log(`Slider öğesi güncelleniyor: ID=${item.id}, Yeni sıra=${item.order}`);
        
        await tx.slider.update({
          where: { id: item.id },
          data: { orderNumber: item.order }
        });
      }
      
      // Başarılı bir şekilde güncellenmiş tüm slider öğelerini getir
      const updatedSliders = await tx.slider.findMany({
        orderBy: { orderNumber: 'asc' }
      });
      
      return updatedSliders;
    });
    
    // Önbelleği temizle - tüm ilgili sayfaları yeniden doğrula
    revalidatePath('/api/slider');
    revalidatePath('/[lang]/admin/hero-slider');
    revalidatePath('/[lang]'); // Ana sayfa
    
    console.log('Slider yeniden sıralama başarılı, önbellek temizlendi');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Slider öğeleri başarıyla yeniden sıralandı', 
        data: result 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Slider öğeleri yeniden sıralanırken hata:', error);
    
    if (error.message === 'Her öğenin id ve order alanları olmalıdır') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Slider öğeleri yeniden sıralanırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
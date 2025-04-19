import { NextRequest, NextResponse } from 'next/server';
// updateGalleryItemsOrder fonksiyonu olmadığı için admin/galleryData'dan reorderGalleryItems fonksiyonunu kullanacağız
import { reorderGalleryItems } from '../../../../app/data/admin/galleryData';
import { revalidatePath } from 'next/cache';

// Galeri öğelerinin sırasını güncelle
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.ids || !Array.isArray(data.ids)) {
      return NextResponse.json(
        { error: 'Geçersiz veri: ids alanı bir dizi olmalıdır' },
        { status: 400 }
      );
    }
    
    // ids dizisini {id: string, order: number} formatına dönüştür
    const items = data.ids.map((id: string, index: number) => ({
      id,
      order: index
    }));
    
    // reorderGalleryItems fonksiyonunu kullan
    const success = await reorderGalleryItems(items);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Galeri öğelerinin sırası güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Cache'i yenile
    revalidatePath('/gallery');
    revalidatePath('/admin/gallery');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Galeri öğelerinin sırası güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Galeri öğelerinin sırası güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
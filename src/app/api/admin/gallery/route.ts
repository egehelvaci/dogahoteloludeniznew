import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Dynamic API route
export const dynamic = 'force-dynamic';

// GET endpoint - Galeri öğelerini listeler
export async function GET() {
  try {
    // Tüm galeri öğelerini getir ve sırala
    const galleryItems = await prisma.gallery.findMany({
      orderBy: {
        orderNumber: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Galeri öğeleri başarıyla alındı',
      items: galleryItems,
    });
  } catch (error) {
    console.error('Galeri öğeleri alınırken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğeleri alınırken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST endpoint - Yeni galeri öğesi ekler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Eğer sıralama işlemi ise
    if (body.action === 'reorder') {
      return handleReorder(body);
    }
    
    console.log('POST: API çağrısı alındı, veri:', body);
    
    // URL'lerin doğru bir şekilde işlendiğinden emin ol
    const imageUrl = body.imageUrl || body.image_url || null;
    const videoUrl = body.videoUrl || body.video_url || null;
    const thumbnailUrl = body.thumbnailUrl || null; // Video thumbnail URL'i
    
    // Tip kontrolü
    let type = body.type || 'image';
    
    // URL'lerin varlık kontrolü
    if (!imageUrl && !videoUrl) {
      console.error('API hatası: Görsel veya video URL\'si gerekli');
      return NextResponse.json({
        success: false,
        message: 'Görsel veya video URL\'si gerekli'
      }, { status: 400 });
    }

    // Tip ve URL tutarlılığı kontrolü
    if (type === 'image' && !imageUrl) {
      console.warn('API uyarısı: Tip "image" olarak belirtilmiş ama imageUrl yok. videoUrl kullanılıyor');
      return NextResponse.json({
        success: false,
        message: 'Görsel tipi seçildi fakat görsel URL\'si eksik'
      }, { status: 400 });
    }
    
    if (type === 'video' && !videoUrl) {
      console.warn('API uyarısı: Tip "video" olarak belirtilmiş ama videoUrl yok. imageUrl kullanılıyor');
      return NextResponse.json({
        success: false,
        message: 'Video tipi seçildi fakat video URL\'si eksik'
      }, { status: 400 });
    }
    
    // URL değerine göre tipi otomatik belirle (tip belirtilmemişse)
    if (!body.type) {
      if (videoUrl && !imageUrl) {
        type = 'video';
      } else if (imageUrl && !videoUrl) {
        type = 'image';
      }
      // Eğer her iki URL de varsa, gelen body.type değerini kullan
    }
    
    console.log('API: Tip ve URL\'ler doğrulandı:', { type, imageUrl, videoUrl, thumbnailUrl });
    
    // Video öğesi eklerken thumbnail değerini ayarla
    const isVideo = type === 'video' || videoUrl;
    let finalImageUrl = imageUrl;

    // Video ise thumbnail değerini ayarla
    if (isVideo) {
      // Video için öncelikle thumbnailUrl kullan, yoksa imageUrl'i kullan
      finalImageUrl = thumbnailUrl || imageUrl;
      
      if (!finalImageUrl) {
        console.warn('Video thumbnail bulunamadı, lütfen bir görsel yükleyin veya kapak resmi oluşturun');
      } else {
        console.log(`Video thumbnail ayarlandı: ${finalImageUrl} (${thumbnailUrl ? 'API thumbnail' : (imageUrl ? 'Image URL' : 'Thumbnail yok')})`);
      }
    }

    const itemData = {
      ...body,
      imageUrl: finalImageUrl, // imageUrl alanı video için thumbnail olarak kullanılacak
      videoUrl: isVideo ? videoUrl : null,
      type: isVideo ? 'video' : 'image'
    };
    
    // Konsola işlem bilgisini yaz
    console.log('Oluşturulan galeri öğesi:', {
      type: itemData.type,
      imageUrl: itemData.imageUrl,
      videoUrl: itemData.videoUrl,
      thumbnailUrl: thumbnailUrl,
      isVideoWithThumbnail: isVideo && !!finalImageUrl
    });
    
    // En yüksek sıra numarasını bul ve 1 ekle
    const nextOrder = await getNextOrderNumber();
    
    // Yeni galeri öğesi ekle
    const newGalleryItem = await prisma.gallery.create({
      data: {
        titleTR: itemData.titleTR || '',
        titleEN: itemData.titleEN || '',
        descriptionTR: itemData.descriptionTR || '',
        descriptionEN: itemData.descriptionEN || '',
        imageUrl: itemData.imageUrl,
        videoUrl: itemData.videoUrl,
        type: itemData.type,
        orderNumber: nextOrder,
      },
    });
    
    console.log('Yeni galeri öğesi oluşturuldu:', newGalleryItem);
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla eklendi',
      item: newGalleryItem,
    });
    
  } catch (error) {
    console.error('Galeri öğesi eklenirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi eklenirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Sıralama işlemini yönetir
async function handleReorder(body: { items: Array<{ id: string; orderNumber: number }> }) {
  try {
    // Paralel işlemler için Promise.all kullanıyoruz
    const updates = body.items.map((item) => {
      return prisma.gallery.update({
        where: { id: item.id },
        data: { orderNumber: item.orderNumber },
      });
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({
      success: true,
      message: 'Sıralama başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Sıralama güncellenirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Sıralama güncellenirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Bir sonraki sıra numarasını belirler
async function getNextOrderNumber(): Promise<number> {
  const result = await prisma.gallery.aggregate({
    _max: {
      orderNumber: true,
    },
  });
  
  return (result._max.orderNumber || 0) + 1;
}

// Note: We will need POST, PUT, DELETE handlers here later
// to fully replace the fs logic from gallery.ts

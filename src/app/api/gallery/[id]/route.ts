import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { notifyGalleryUpdated } from '../../websocket/route';

export const dynamic = 'force-dynamic';

// GET: ID'ye göre galeri öğesi getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Belirtilen ID'ye sahip galeri öğesini getir
    const galleryItem = await prisma.gallery.findUnique({
      where: { id },
    });
    
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, message: 'Galeri öğesi bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla alındı',
      item: galleryItem,
    });
  } catch (error) {
    console.error('Galeri öğesi alınırken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi alınırken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT: ID'ye göre galeri öğesi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Güncellenecek verileri hazırla
    const updateData = {
      titleTR: body.titleTR,
      titleEN: body.titleEN,
      descriptionTR: body.descriptionTR,
      descriptionEN: body.descriptionEN,
      type: body.type,
    };
    
    // İsteğe bağlı alanları kontrol et
    if (body.imageUrl) {
      updateData['imageUrl'] = body.imageUrl;
    }
    
    if (body.videoUrl !== undefined) {
      updateData['videoUrl'] = body.videoUrl;
    }
    
    // Galeri öğesini güncelle
    const updatedItem = await prisma.gallery.update({
      where: { id },
      data: updateData,
    });
    
    // Bildirim gönder
    notifyGalleryUpdated();
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla güncellendi',
      item: updatedItem,
    });
  } catch (error) {
    console.error('Galeri öğesi güncellenirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi güncellenirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: ID'ye göre galeri öğesi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Belirtilen ID'ye sahip galeri öğesini sil
    await prisma.gallery.delete({
      where: { id },
    });
    
    // Bildirim gönder
    notifyGalleryUpdated();
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla silindi',
    });
  } catch (error) {
    console.error('Galeri öğesi silinirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi silinirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

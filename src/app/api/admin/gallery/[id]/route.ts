import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Belirli bir galeri öğesini getir
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    const galleryItem = await prisma.gallery.findUnique({
      where: { id }
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
      item: galleryItem
    });
  } catch (error) {
    console.error('Galeri öğesi alınırken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi alınırken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT - Galeri öğesini güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Öğenin var olup olmadığını kontrol et
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Güncellenecek galeri öğesi bulunamadı' },
        { status: 404 }
      );
    }
    
    // Öğeyi güncelle
    const updatedItem = await prisma.gallery.update({
      where: { id },
      data: {
        titleTR: body.titleTR !== undefined ? body.titleTR : existingItem.titleTR,
        titleEN: body.titleEN !== undefined ? body.titleEN : existingItem.titleEN,
        descriptionTR: body.descriptionTR !== undefined ? body.descriptionTR : existingItem.descriptionTR,
        descriptionEN: body.descriptionEN !== undefined ? body.descriptionEN : existingItem.descriptionEN,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existingItem.imageUrl,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingItem.videoUrl,
        type: body.type !== undefined ? body.type : existingItem.type,
        // Sıra değişmiyorsa mevcut sırayı koru
        orderNumber: body.orderNumber !== undefined ? body.orderNumber : existingItem.orderNumber
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla güncellendi',
      item: updatedItem
    });
  } catch (error) {
    console.error('Galeri öğesi güncellenirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi güncellenirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE - Galeri öğesini sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Öğenin var olup olmadığını kontrol et
    const existingItem = await prisma.gallery.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Silinecek galeri öğesi bulunamadı' },
        { status: 404 }
      );
    }
    
    // Galeri öğesini sil
    await prisma.gallery.delete({
      where: { id }
    });
    
    // Kalan öğelerin sırasını yeniden düzenle
    await reorderRemainingItems();
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla silindi'
    });
  } catch (error) {
    console.error('Galeri öğesi silinirken hata:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Galeri öğesi silinirken bir hata oluştu',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Kalan öğelerin sırasını yeniden düzenler
async function reorderRemainingItems() {
  const items = await prisma.gallery.findMany({
    orderBy: { orderNumber: 'asc' }
  });
  
  const updates = items.map((item, index) => {
    return prisma.gallery.update({
      where: { id: item.id },
      data: { orderNumber: index }
    });
  });
  
  await Promise.all(updates);
} 
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToImageKit } from '../../../../lib/imagekitServer';
import { prisma } from '../../../../lib/prisma';

// API'yi /api/upload/rooms yolunda kullanılabilir hale getir
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Standart oda görsellerini yükleme işlemi başlatıldı');
    
    // Standart oda ID'sini bul
    const standardRoom = await prisma.room.findFirst({
      where: {
        type: 'standard'
      }
    });

    if (!standardRoom) {
      return NextResponse.json({
        success: false,
        message: 'Standart oda bulunamadı'
      }, { status: 404 });
    }

    console.log('Standart oda bulundu:', standardRoom.id);

    // public/images/rooms/standart dizininden görselleri oku
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'rooms', 'standart');
    const files = await fs.readdir(imagesDir);
    
    // Sadece jpg dosyalarını filtrele
    const imageFiles = files.filter(file => file.endsWith('.jpg'));
    
    console.log(`Yüklenecek görsel sayısı: ${imageFiles.length}`);
    
    // Önce mevcut galeri görsellerini temizle
    await prisma.roomGallery.deleteMany({
      where: {
        roomId: standardRoom.id
      }
    });
    
    // Görselleri ImageKit'e yükle ve veritabanına kaydet
    const results = [];
    let order = 0;
    
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const fileBuffer = await fs.readFile(filePath);
      
      // Dosya adını düzenle
      const fileName = `room_standard_${order}_${Date.now()}.jpg`;
      
      console.log(`Yükleniyor: ${file} -> ${fileName}`);
      
      // ImageKit'e yükle
      const uploadResult = await uploadToImageKit(
        fileBuffer,
        fileName,
        'rooms/standard'
      );
      
      if (uploadResult.success && uploadResult.url) {
        console.log(`Başarılı yükleme: ${uploadResult.url}`);
        
        // Ana görsel için
        if (file === 'standard-room.jpg') {
          // Ana görseli güncelle
          await prisma.room.update({
            where: {
              id: standardRoom.id
            },
            data: {
              mainImageUrl: uploadResult.url
            }
          });
          
          console.log(`Ana görsel güncellendi: ${uploadResult.url}`);
        }
        
        // Galeriye ekle
        const galleryItem = await prisma.roomGallery.create({
          data: {
            roomId: standardRoom.id,
            imageUrl: uploadResult.url,
            orderNumber: order
          }
        });
        
        results.push({
          originalFile: file,
          url: uploadResult.url,
          order
        });
        
        order++;
      } else {
        console.error(`${file} dosyası yüklenemedi:`, uploadResult.error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${results.length} görsel başarıyla yüklendi`,
      results
    });
    
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'Görsel yüklenirken bir hata oluştu',
      error: (error as Error).message
    }, { status: 500 });
  }
} 
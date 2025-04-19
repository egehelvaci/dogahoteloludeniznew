import { NextRequest, NextResponse } from 'next/server';
import { uploadToTebi } from '../../../../../../../lib/tebi';
import { executeQuery } from '../../../../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Yüklenebilecek maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id;
    
    // Servisin var olup olmadığını kontrol et
    const serviceCheck = await executeQuery(
      "SELECT id FROM services WHERE id = $1",
      [serviceId]
    );
    
    if (serviceCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Servis bulunamadı', success: false },
        { status: 404 }
      );
    }
    
    // İstek formunu al
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Dosya kontrolü
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı', success: false },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece JPEG, PNG, WebP, JPG ve GIF formatları desteklenir.', success: false },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'ı geçemez', success: false },
        { status: 400 }
      );
    }
    
    console.log(`Servis Galeri API: Dosya Tebi.io'ya yükleniyor - Servis ID: ${serviceId}, İsim: ${file.name}, Boyut: ${file.size} bytes`);
    
    // Tebi.io'ya yükle
    const tebiResult = await uploadToTebi({
      file,
      maxSizeInBytes: MAX_FILE_SIZE,
      checkFileType: true,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      path: `dogahotel/services/${serviceId}`
    });
    
    if (!tebiResult.success) {
      console.error('Servis Galeri API: Tebi yükleme hatası', tebiResult.message);
      return NextResponse.json(
        { error: tebiResult.message || 'Dosya yüklenemedi', success: false },
        { status: 500 }
      );
    }
    
    console.log(`Servis Galeri API: Dosya başarıyla yüklendi: ${tebiResult.fileUrl}`);
    
    // Sıra numarasını belirle
    const orderQuery = `
      SELECT COALESCE(MAX(order_number), 0) + 1 as next_order
      FROM service_gallery
      WHERE service_id = $1
    `;
    
    const orderResult = await executeQuery(orderQuery, [serviceId]);
    const orderNumber = orderResult.rows[0].next_order;
    
    // Görseli veritabanına kaydet
    const insertQuery = `
      INSERT INTO service_gallery (
        id,
        service_id,
        image_url,
        order_number,
        created_at
      ) VALUES (
        $1, $2, $3, $4, CURRENT_TIMESTAMP
      ) RETURNING 
        id,
        service_id as "serviceId",
        image_url as "imageUrl",
        order_number as "order",
        created_at as "createdAt"
    `;
    
    const insertResult = await executeQuery(insertQuery, [
      uuidv4(),
      serviceId,
      tebiResult.fileUrl,
      orderNumber
    ]);
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      filePath: tebiResult.fileUrl,
      url: tebiResult.fileUrl,
      fileName: file.name,
      fileType: file.type,
      galleryItem: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Servis Galeri Upload API hatası:', error);
    return NextResponse.json(
      { error: `Dosya yüklenirken bir hata oluştu: ${(error as Error).message}`, success: false },
      { status: 500 }
    );
  }
} 
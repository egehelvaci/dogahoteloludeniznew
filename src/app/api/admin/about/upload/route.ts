import { NextRequest, NextResponse } from 'next/server';
import { uploadToImageKit } from '../../../../../lib/imagekitServer';
import { executeQuery } from '../../../../../lib/db';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }
    
    // Dosya boyutu kontrolü (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 10MB\'den küçük olmalıdır' },
        { status: 400 }
      );
    }
    
    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Sadece JPEG, PNG ve WEBP formatlarına izin verilmektedir' },
        { status: 400 }
      );
    }
    
    console.log('ImageKit\'e yükleniyor...');
    
    // Dosya içeriğini al
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ImageKit'e yükle
    const fileName = `about_${Date.now()}_${file.name}`;
    const result = await uploadToImageKit(buffer, fileName, 'dogahotel/about');
    
    if (!result.success || !result.url) {
      throw new Error('ImageKit yükleme hatası: ' + (result.error || 'Bilinmeyen hata'));
    }
    
    console.log('ImageKit yükleme başarılı');
    
    // Veritabanı tablosunu kontrol et
    try {
      // Önce about_sections tablosunu kontrol et
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'about_sections'
        )
      `;
      
      const tableExists = await executeQuery(checkTableQuery);
      
      if (!tableExists.rows[0].exists) {
        // Tablo yoksa oluştur
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS about_sections (
            id TEXT PRIMARY KEY,
            title_tr TEXT NOT NULL,
            title_en TEXT,
            subtitle_tr TEXT,
            subtitle_en TEXT,
            content_tr TEXT,
            content_en TEXT,
            image_url TEXT,
            position INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        await executeQuery(createTableQuery);
        console.log('Tablo oluşturuldu: about_sections');
      }
      
      // Şimdi sütunları kontrol et
      for (const column of ['badges_tr', 'badges_en']) {
        const checkColumnQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'about_sections' AND column_name = '${column}'
          )
        `;
        
        const columnExists = await executeQuery(checkColumnQuery);
        
        if (!columnExists.rows[0].exists) {
          // Sütun yoksa ekle
          const addColumnQuery = `
            ALTER TABLE about_sections 
            ADD COLUMN ${column} TEXT DEFAULT ''
          `;
          
          await executeQuery(addColumnQuery);
          console.log(`Sütun eklendi: ${column}`);
        }
      }
    } catch (dbError) {
      console.error('Veritabanı şema kontrolü hatası:', dbError);
      // Şema hatası olsa bile devam et ve veri eklemeyi dene
    }
    
    // About verilerini kontrol et ve güncelle
    try {
      const existingDataQuery = `
        SELECT * FROM about_sections 
        ORDER BY position ASC
        LIMIT 1
      `;
      
      const existingData = await executeQuery(existingDataQuery);
      
      if (existingData && existingData.rows && existingData.rows.length > 0) {
        // Kayıt varsa güncelle
        const updateQuery = `
          UPDATE about_sections 
          SET 
            image_url = $1, 
            updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        
        await executeQuery(updateQuery, [
          result.url,
          existingData.rows[0].id
        ]);
        
        console.log('Mevcut kayıt güncellendi');
      } else {
        // Kayıt yoksa yeni bir kayıt oluştur
        const insertQuery = `
          INSERT INTO about_sections (
            id, 
            title_tr, 
            title_en, 
            image_url, 
            position, 
            created_at, 
            updated_at
          ) 
          VALUES (
            $1, 'Hakkımızda', 'About Us', $2, 1, NOW(), NOW()
          )
          RETURNING *
        `;
        
        await executeQuery(insertQuery, [
          Date.now().toString(),
          result.url
        ]);
        
        console.log('Yeni kayıt oluşturuldu');
      }
    } catch (dbError) {
      console.error('Veritabanı işlem hatası:', dbError);
      throw new Error('Veritabanı güncellenemedi');
    }
    
    // API rotalarını yeniden doğrula
    revalidatePath('/api/about');
    revalidatePath('/api/admin/about');
    revalidatePath('/about');
    revalidatePath('/[lang]/about');
    revalidatePath('/[lang]/admin/about');
    
    return NextResponse.json({ 
      success: true,
      url: result.url,
      fileId: result.fileId,
      message: 'Görsel başarıyla yüklendi'
    });
    
  } catch (error) {
    console.error('About resmi yüklenirken hata:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Resim yükleme başarısız oldu' 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// About verilerini getir
export async function GET() {
  try {
    console.log('API: GET /api/admin/about isteği alındı');
    
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
            title_en TEXT NOT NULL,
            subtitle_tr TEXT,
            subtitle_en TEXT,
            content_tr TEXT NOT NULL,
            content_en TEXT NOT NULL,
            image_url TEXT,
            position INTEGER NOT NULL DEFAULT 0,
            show_on_home BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            badges_tr TEXT NOT NULL DEFAULT '',
            badges_en TEXT NOT NULL DEFAULT ''
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
          let addColumnQuery;
          
          if (column === 'show_on_home') {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} BOOLEAN DEFAULT true
            `;
          } else if (column === 'position') {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} INTEGER DEFAULT 0
            `;
          } else {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} TEXT DEFAULT ''
            `;
          }
          
          await executeQuery(addColumnQuery);
          console.log(`Sütun eklendi: ${column}`);
        }
      }
    } catch (dbError) {
      console.error('Veritabanı şema kontrolü hatası:', dbError);
      // Veritabanı tablosu oluşturulamadı durumunda boş veri döndür
      return NextResponse.json({
        success: true,
        titleTR: 'Hakkımızda',
        titleEN: 'About Us',
        subtitleTR: '',
        subtitleEN: '',
        contentTR: [],
        contentEN: [],
        imageUrl: '',
        badgesTR: [],
        badgesEN: [],
        position: 0,
        showOnHome: true,
        heroImage: '',
        mainImage: ''
      });
    }
    
    // Verileri getir - Sütun adlarını kontrol et
    const query = `
      SELECT 
        id,
        title_tr as "titleTR",
        title_en as "titleEN",
        subtitle_tr as "subtitleTR",
        subtitle_en as "subtitleEN",
        content_tr as "contentTR",
        content_en as "contentEN",
        image_url as "imageUrl",
        COALESCE(badges_tr, '') as "badgesTR",
        COALESCE(badges_en, '') as "badgesEN",
        position,
        show_on_home as "showOnHome",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM about_sections
      ORDER BY position ASC
      LIMIT 1
    `;
    
    let result;
    try {
      result = await executeQuery(query);
    } catch (dbError) {
      console.error('Veritabanı sorgusu hatası:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Veritabanı sorgusu hatası' 
        },
        { status: 500 }
      );
    }
    
    if (!result || !result.rows || result.rows.length === 0) {
      // Veri yoksa temel yapıyla boş veri döndür
      return NextResponse.json({
        success: true,
        titleTR: 'Hakkımızda',
        titleEN: 'About Us',
        subtitleTR: '',
        subtitleEN: '',
        contentTR: [],
        contentEN: [],
        imageUrl: '',
        badgesTR: [],
        badgesEN: [],
        position: 0,
        showOnHome: true,
        heroImage: '',
        mainImage: ''
      });
    }
    
    // Veri varsa döndür ve imageUrl'i hem hero hem de main image olarak kullan
    const aboutData = result.rows[0];
    
    // Alanları dönüştür
    const transformedData = {
      ...aboutData,
      contentTR: Array.isArray(aboutData.contentTR) 
        ? aboutData.contentTR 
        : aboutData.contentTR ? aboutData.contentTR.split("\n") : [],
      contentEN: Array.isArray(aboutData.contentEN) 
        ? aboutData.contentEN 
        : aboutData.contentEN ? aboutData.contentEN.split("\n") : [],
      badgesTR: Array.isArray(aboutData.badgesTR) 
        ? aboutData.badgesTR 
        : aboutData.badgesTR ? aboutData.badgesTR.split(",") : [],
      badgesEN: Array.isArray(aboutData.badgesEN) 
        ? aboutData.badgesEN 
        : aboutData.badgesEN ? aboutData.badgesEN.split(",") : [],
      // Hero ve main image için de aynı URL'i kullan
      heroImage: aboutData.imageUrl,
      mainImage: aboutData.imageUrl
    };
    
    return NextResponse.json(transformedData, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, must-revalidate'
          }
        });
  } catch (error) {
    console.error('API: About verisi alınırken hata:', error);
    let errorMessage = 'About verisi alınamadı.';
    if (error instanceof Error) {
      errorMessage = `About verisi alınamadı: ${error.message}`;
    }
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// About verilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    console.log('API: PUT /api/admin/about isteği alındı');
    
    const data = await request.json();
    
    if (!data) {
    return NextResponse.json(
      {
          success: false,
          error: 'Geçersiz veri formatı' 
        },
        { status: 400 }
      );
    }
    
    // İçerik kontrolü
    if (!data.titleTR || !data.contentTR) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Başlık ve içerik alanları zorunludur' 
        },
        { status: 400 }
      );
    }
    
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
            title_en TEXT NOT NULL,
            subtitle_tr TEXT,
            subtitle_en TEXT,
            content_tr TEXT NOT NULL,
            content_en TEXT NOT NULL,
            image_url TEXT,
            position INTEGER NOT NULL DEFAULT 0,
            show_on_home BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            badges_tr TEXT NOT NULL DEFAULT '',
            badges_en TEXT NOT NULL DEFAULT ''
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
          let addColumnQuery;
          
          if (column === 'show_on_home') {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} BOOLEAN DEFAULT true
            `;
          } else if (column === 'position') {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} INTEGER DEFAULT 0
            `;
          } else {
            addColumnQuery = `
              ALTER TABLE about_sections 
              ADD COLUMN ${column} TEXT DEFAULT ''
            `;
          }
          
          await executeQuery(addColumnQuery);
          console.log(`Sütun eklendi: ${column}`);
        }
      }
    } catch (dbError) {
      console.error('Veritabanı şema kontrolü hatası:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Veritabanı yapılandırma hatası' 
        },
        { status: 500 }
      );
    }
    
    // Veritabanında veri var mı kontrol et
    const checkQuery = `SELECT id FROM about_sections LIMIT 1`;
    const checkResult = await executeQuery(checkQuery);
    
    let result;
    
    // Önce içerik alanlarını dizi ise stringe dönüştür
    const contentTR = Array.isArray(data.contentTR) ? data.contentTR.join("\n") : data.contentTR;
    const contentEN = Array.isArray(data.contentEN) ? data.contentEN.join("\n") : data.contentEN;
    const badgesTR = Array.isArray(data.badgesTR) ? data.badgesTR.join(",") : data.badgesTR;
    const badgesEN = Array.isArray(data.badgesEN) ? data.badgesEN.join(",") : data.badgesEN;
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      // Veri yoksa yeni ekle
      const insertQuery = `
        INSERT INTO about_sections (
          id, 
          title_tr, 
          title_en, 
          subtitle_tr, 
          subtitle_en, 
          content_tr, 
          content_en, 
          image_url,
          badges_tr,
          badges_en,
          position,
          show_on_home,
          created_at, 
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        )
        RETURNING *
      `;
      
      result = await executeQuery(insertQuery, [
        uuidv4(),
        data.titleTR,
        data.titleEN || '',
        data.subtitleTR || '',
        data.subtitleEN || '',
        contentTR,
        contentEN || '',
        data.imageUrl || '',
        badgesTR || '',
        badgesEN || '',
        data.position || 0,
        data.showOnHome !== undefined ? data.showOnHome : true
      ]);
      
      console.log('Yeni about kaydı oluşturuldu');
    } else {
      // Veri varsa güncelle
      const id = checkResult.rows[0].id;
      
      const updateQuery = `
        UPDATE about_sections
        SET 
          title_tr = $1,
          title_en = $2,
          subtitle_tr = $3,
          subtitle_en = $4,
          content_tr = $5,
          content_en = $6,
          image_url = $7,
          badges_tr = $8,
          badges_en = $9,
          position = $10,
          show_on_home = $11,
          updated_at = NOW()
        WHERE id = $12
        RETURNING *
      `;
      
      result = await executeQuery(updateQuery, [
        data.titleTR,
        data.titleEN || '',
        data.subtitleTR || '',
        data.subtitleEN || '',
        contentTR,
        contentEN || '',
        data.imageUrl || '',
        badgesTR || '',
        badgesEN || '',
        data.position !== undefined ? data.position : 0,
        data.showOnHome !== undefined ? data.showOnHome : true,
        id
      ]);
      
      console.log('Mevcut about kaydı güncellendi');
    }
    
    // Verileri dönüştür
    const updatedData = {
      ...result.rows[0],
      titleTR: result.rows[0].title_tr,
      titleEN: result.rows[0].title_en,
      subtitleTR: result.rows[0].subtitle_tr,
      subtitleEN: result.rows[0].subtitle_en,
      contentTR: result.rows[0].content_tr ? result.rows[0].content_tr.split("\n") : [],
      contentEN: result.rows[0].content_en ? result.rows[0].content_en.split("\n") : [],
      imageUrl: result.rows[0].image_url,
      badgesTR: result.rows[0].badges_tr ? result.rows[0].badges_tr.split(",") : [],
      badgesEN: result.rows[0].badges_en ? result.rows[0].badges_en.split(",") : [],
      showOnHome: result.rows[0].show_on_home,
      position: result.rows[0].position,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      heroImage: result.rows[0].image_url,
      mainImage: result.rows[0].image_url
    };
    
    // API yollarını yeniden doğrula
    revalidatePath('/api/about');
    revalidatePath('/api/admin/about');
    revalidatePath('/about');
    revalidatePath('/[lang]/about');
    
    return NextResponse.json({
      success: true,
      message: 'About verisi başarıyla güncellendi',
      data: updatedData
    });
    
  } catch (error) {
    console.error('API: About verisi güncellenirken hata:', error);
    let errorMessage = 'About verisi güncellenemedi.';
    if (error instanceof Error) {
      errorMessage = `About verisi güncellenemedi: ${error.message}`;
    }
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

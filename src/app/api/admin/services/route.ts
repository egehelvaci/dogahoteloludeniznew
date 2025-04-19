import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface ServiceItem {
  id: string;
  titleTR: string;
  titleEN: string;
  descriptionTR: string;
  descriptionEN: string;
  image: string;
  order: number;
  active: boolean;
  gallery?: string[];
}

// Tüm servisleri getir
export async function GET() {
  try {
    const query = `
      SELECT 
        s.id,
        s.title_tr as "titleTR",
        s.title_en as "titleEN",
        s.description_tr as "descriptionTR",
        s.description_en as "descriptionEN",
        s.main_image_url as image,
        s.order_number as order,
        s.active,
        s.details_tr as "detailsTR",
        s.details_en as "detailsEN",
        COALESCE(
          (SELECT json_agg(sg.image_url ORDER BY sg.order_number)
           FROM service_gallery sg
           WHERE sg.service_id = s.id),
          '[]'::json
        ) as gallery
      FROM services s
      ORDER BY s.order_number ASC
    `;
    
    console.log('GET /api/admin/services/ isteği alındı');
    
    const result = await executeQuery(query);
    return NextResponse.json({
      success: true,
      items: result.rows
    });
  } catch (error) {
    console.error("Servis verileri getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Servis verileri getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni servis ekle
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/services/ isteği alındı');
    
    // Body verilerini oku
    const body = await request.json();
    
    console.log('Servis ekleme API isteği alındı:', JSON.stringify(body, null, 2));
    
    // Gerekli alanları kontrol et - image artık zorunlu değil
    if (!body.titleTR || !body.titleEN || !body.descriptionTR || !body.descriptionEN || !body.id) {
      console.log('Eksik alanlar:', {
        titleTR: !body.titleTR, 
        titleEN: !body.titleEN, 
        descriptionTR: !body.descriptionTR, 
        descriptionEN: !body.descriptionEN,
        id: !body.id
      });
      return NextResponse.json(
        { success: false, message: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Servis ekle
    const query = `
      INSERT INTO services (
        id, title_tr, title_en, description_tr, description_en, 
        main_image_url, active, details_tr, details_en, order_number, updated_at, created_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
        (SELECT COALESCE(MAX(order_number), 0) + 1 FROM services),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id
    `;

    console.log('SQL sorgusu hazırlandı:', query);
    console.log('Sorgu parametreleri:', [
      body.id, body.titleTR, body.titleEN, body.descriptionTR, body.descriptionEN,
      body.image || null, body.active === undefined ? true : body.active,
      body.detailsTR || null, body.detailsEN || null
    ]);

    const result = await executeQuery(query, [
      body.id, body.titleTR, body.titleEN, body.descriptionTR, body.descriptionEN,
      body.image || null, body.active === undefined ? true : body.active,
      body.detailsTR || null, body.detailsEN || null
    ]);

    console.log('Servis ekleme SQL sorgusu sonucu:', result);

    if (result.rowCount === 0) {
      console.log('Servis eklenemedi, satır sayısı 0');
      return NextResponse.json(
        { success: false, message: "Servis eklenemedi" },
        { status: 500 }
      );
    }

    const serviceId = result.rows[0].id;
    console.log('Yeni servis ID:', serviceId);

    // Gallery resimlerini işle - body.gallery veya body.images'dan
    const galleryImages = body.gallery || body.images || [];
    console.log('Galeri resimleri:', galleryImages);

    if (galleryImages.length > 0) {
      // Her bir galeri resmi için service_gallery tablosuna ekle
      for (let i = 0; i < galleryImages.length; i++) {
        const galleryQuery = `
          INSERT INTO service_gallery (service_id, image_url, order_number)
          VALUES ($1, $2, $3)
        `;
        console.log(`Galeri resmi ${i+1} ekleniyor:`, galleryImages[i]);
        
        await executeQuery(galleryQuery, [
          serviceId,
          galleryImages[i],
          i + 1
        ]);
      }
      console.log('Tüm galeri resimleri eklendi');
    }

    // Daha fazla bilgi döndürmek için servisin tamamını veritabanından çek
    const serviceQuery = `
      SELECT 
        s.id,
        s.title_tr as "titleTR",
        s.title_en as "titleEN",
        s.description_tr as "descriptionTR",
        s.description_en as "descriptionEN",
        s.main_image_url as image,
        s.order_number as order,
        s.active,
        s.details_tr as "detailsTR",
        s.details_en as "detailsEN",
        COALESCE(
          (SELECT json_agg(sg.image_url ORDER BY sg.order_number)
           FROM service_gallery sg
           WHERE sg.service_id = s.id),
          '[]'::json
        ) as gallery
      FROM services s
      WHERE s.id = $1
    `;

    const serviceResult = await executeQuery(serviceQuery, [serviceId]);
    const serviceData = serviceResult.rows[0];

    return NextResponse.json({
      success: true,
      message: "Servis başarıyla eklendi",
      id: serviceId,
      item: serviceData
    });
    
  } catch (error) {
    console.error("Servis eklenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Servis eklenirken bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}

// Servis güncelle
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/admin/services/ isteği alındı');
    
    // Body verilerini oku
    const body = await request.json();
    console.log('Servis güncelleme isteği alındı:', JSON.stringify(body, null, 2));
    
    // ID kontrolü
    if (!body.id) {
      console.log('ID eksik');
      return NextResponse.json(
        { success: false, message: "Güncellenecek servisin ID'si gereklidir" },
        { status: 400 }
      );
    }
    
    // Gerekli alanları kontrol et
    if (!body.titleTR || !body.titleEN || !body.descriptionTR || !body.descriptionEN) {
      console.log('Eksik alanlar');
      return NextResponse.json(
        { success: false, message: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Transaction başlat
    const client = await (await executeQuery('BEGIN')).client;
    
    try {
      // Servisin var olup olmadığını kontrol et
      const checkQuery = `SELECT * FROM services WHERE id = $1`;
      const checkResult = await client.query(checkQuery, [body.id]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log('Güncellenecek servis bulunamadı:', body.id);
        return NextResponse.json(
          { success: false, message: "Güncellenecek servis bulunamadı" },
          { status: 404 }
        );
      }
      
      // Servisi güncelle
      const updateQuery = `
        UPDATE services SET
          title_tr = $1,
          title_en = $2,
          description_tr = $3,
          description_en = $4,
          main_image_url = $5,
          active = $6,
          details_tr = $7,
          details_en = $8,
          order_number = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;
      
      console.log('Servis güncelleme sorgusu hazırlandı');
      
      const updateValues = [
        body.titleTR,
        body.titleEN,
        body.descriptionTR,
        body.descriptionEN,
        body.image || null,
        body.active !== undefined ? body.active : true,
        body.detailsTR || null,
        body.detailsEN || null,
        body.order || checkResult.rows[0].order_number,
        body.id
      ];
      
      // Servisi güncelle
      await client.query(updateQuery, updateValues);
      console.log('Servis başarıyla güncellendi');
      
      // Galeri öğelerini güncelle
      if (body.gallery || body.images) {
        const galleryImages = body.gallery || body.images || [];
        console.log('Galeri resimleri:', galleryImages);
        
        // Önce mevcut galeriyi temizle
        await client.query('DELETE FROM service_gallery WHERE service_id = $1', [body.id]);
        console.log('Mevcut galeri resimleri silindi');
        
        // Yeni galeri resimlerini ekle
        if (galleryImages.length > 0) {
          for (let i = 0; i < galleryImages.length; i++) {
            const galleryQuery = `
              INSERT INTO service_gallery (service_id, image_url, order_number)
              VALUES ($1, $2, $3)
            `;
            console.log(`Galeri resmi ${i+1} ekleniyor:`, galleryImages[i]);
            
            await client.query(galleryQuery, [
              body.id,
              galleryImages[i],
              i + 1
            ]);
          }
          console.log('Tüm yeni galeri resimleri eklendi');
        }
      }
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      // Güncellenmiş servisi galeri bilgisiyle birlikte getir
      const getQuery = `
        SELECT 
          s.id,
          s.title_tr as "titleTR",
          s.title_en as "titleEN",
          s.description_tr as "descriptionTR",
          s.description_en as "descriptionEN",
          s.main_image_url as image,
          s.order_number as order,
          s.active,
          s.details_tr as "detailsTR",
          s.details_en as "detailsEN",
          COALESCE(
            (SELECT json_agg(sg.image_url ORDER BY sg.order_number)
            FROM service_gallery sg
            WHERE sg.service_id = s.id),
            '[]'::json
          ) as gallery
        FROM services s
        WHERE s.id = $1
      `;
      
      const finalResult = await executeQuery(getQuery, [body.id]);
      
      return NextResponse.json({
        success: true,
        message: "Servis başarıyla güncellendi",
        item: finalResult.rows[0]
      });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      console.error('Servis güncellenirken hata:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Servis güncellenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Servis güncellenirken bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}

// Servis sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Silinecek servisin ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Transaction başlat
    const client = await (await executeQuery('BEGIN')).client;

    try {
    // Servisin var olup olmadığını kontrol et
      const checkQuery = `SELECT * FROM services WHERE id = $1`;
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, message: "Silinecek servis bulunamadı" },
          { status: 404 }
        );
      }
      
      // Önce servise ait galeri öğelerini sil
      await client.query('DELETE FROM service_gallery WHERE service_id = $1', [id]);
    
      // Servisi sil
      await client.query('DELETE FROM services WHERE id = $1', [id]);
      
      // Sıra numaralarını güncelle
      const reorderQuery = `
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY order_number) as new_order
          FROM services
        )
        UPDATE services
        SET order_number = ranked.new_order,
            updated_at = CURRENT_TIMESTAMP
        FROM ranked
        WHERE services.id = ranked.id
      `;
      
      await client.query(reorderQuery);
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: "Servis başarıyla silindi" 
      });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Servis silinirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Servis silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';

// Veritabanı sorgu sonucu tipi
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  client?: DbClient;
}

// Veritabanı istemci tipi
interface DbClient {
  query: (query: string, params?: unknown[]) => Promise<any>;
  release: () => void;
}

// POST - Slider öğelerinin sırasını değiştir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sıralama verilerini kontrol et
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz sıralama verileri' },
        { status: 400 }
      );
    }

    // Öğeleri doğrula
    for (const item of body.items) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { success: false, message: 'Her öğe için ID ve sıra numarası gereklidir' },
          { status: 400 }
        );
      }
    }

    // Transaction başlat
    const beginResult = await executeQuery('BEGIN') as any;
    const client = beginResult.client as DbClient;
    
    try {
      // Her bir öğenin sırasını güncelle
      for (const item of body.items) {
        const updateQuery = `
          UPDATE slider
          SET order_number = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        
        await client.query(updateQuery, [item.order, item.id]);
      }
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      // Güncellenmiş slider öğelerini getir
      const getQuery = `
        SELECT 
          id,
          title_tr as "titleTR",
          title_en as "titleEN",
          subtitle_tr as "subtitleTR",
          subtitle_en as "subtitleEN",
          description_tr as "descriptionTR", 
          description_en as "descriptionEN",
          image_url as image,
          video_url as "videoUrl",
          order_number as order,
          active
        FROM slider
        ORDER BY order_number ASC
      `;
      
      const result = await executeQuery(getQuery) as any;
      
      return NextResponse.json({
        success: true,
        data: result.rows,
        message: 'Slider sıralaması başarıyla güncellendi'
      });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Slider sıralama hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Slider sıralaması güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
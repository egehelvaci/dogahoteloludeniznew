import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';

// GET - About verilerini getir
export async function GET() {
  try {
    console.log('API: GET /api/about/data isteği alındı');
    
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
        video_url as "videoUrl",
        position,
        show_on_home as "showOnHome",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM about_sections
      ORDER BY position ASC
    `;
    
    const result = await executeQuery(query);
    console.log('About verisi başarıyla alındı, veri sayısı:', result.rows.length);
    
    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error: unknown) {
    console.error('API: About verisi alınırken hata:', error);
    let errorMessage = 'About verisi alınamadı.';
    if (error instanceof Error) {
      errorMessage = `About verisi alınamadı: ${error.message}`;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

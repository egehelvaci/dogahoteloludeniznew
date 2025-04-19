import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET: Hakkında verilerini getir
export async function GET() {
  try {
    // En son about kaydını getir
    const result = await executeQuery({
      query: `SELECT * FROM "About" ORDER BY "createdAt" DESC LIMIT 1`,
      values: []
    });

    // Veri varsa döndür
    if (result && result.rows && result.rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: result.rows[0] 
      });
    }

    // Veri yoksa boş bir yanıt döndür
    return NextResponse.json({ 
      success: true, 
      data: null 
    });
  } catch (error) {
    console.error('About verisi alınırken hata:', error);
    return NextResponse.json(
      { success: false, error: 'About verisi alınamadı' },
      { status: 500 }
    );
  }
}

// POST: Hakkında verilerini güncelle veya oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, imageUrl } = body;

    // İlk önce bir kayıt var mı kontrol edelim
    const existingData = await executeQuery({
      query: `SELECT * FROM "About" ORDER BY "createdAt" DESC LIMIT 1`,
      values: []
    });

    let result;
    
    if (existingData && existingData.rows && existingData.rows.length > 0) {
      // Varsa güncelle
      const id = existingData.rows[0].id;
      
      result = await executeQuery({
        query: `
          UPDATE "About" 
          SET 
            "title" = COALESCE($1, "title"),
            "content" = COALESCE($2, "content"),
            "imageUrl" = COALESCE($3, "imageUrl"),
            "updatedAt" = NOW()
          WHERE "id" = $4
          RETURNING *
        `,
        values: [title, content, imageUrl, id]
      });
    } else {
      // Yoksa yeni bir kayıt oluştur
      result = await executeQuery({
        query: `
          INSERT INTO "About" ("title", "content", "imageUrl", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *
        `,
        values: [title, content, imageUrl]
      });
    }

    // API rotasını yeniden doğrula
    revalidatePath('/api/about');
    revalidatePath('/about');

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0]
    });
  } catch (error) {
    console.error('About verisi güncellenirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'About verisi güncellenemedi' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/db";

export const revalidate = 0; // Her istekte yeniden oluştur

// ID'ye göre servis getir - PUBLIC API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Veritabanından belirli ID'ye sahip servisi al
    const query = `
      SELECT * FROM services 
      WHERE id = $1
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Servis bulunamadı' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Hizmet galerisini de al
    const galleryQuery = `
      SELECT * FROM service_gallery
      WHERE service_id = $1
      ORDER BY order_number ASC
    `;
    
    const galleryResult = await executeQuery(galleryQuery, [id]);
    const service = {
      ...result.rows[0],
      gallery: galleryResult.rows
    };
    
    return NextResponse.json(
      { success: true, item: service },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Servis detayı getirilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Servis detayı getirilirken bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
} 
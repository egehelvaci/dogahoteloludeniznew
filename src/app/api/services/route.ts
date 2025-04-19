import { NextResponse } from "next/server";
import { executeQuery } from "../../../lib/db";

export const revalidate = 0; // Her istekte yeniden oluştur

// Tüm servisleri getir - PUBLIC API
export async function GET() {
  try {
    // Veritabanından aktif hizmetleri al ve galeri görsellerini de getir
    const query = `
      SELECT 
        s.id,
        s.title_tr as "titleTR",
        s.title_en as "titleEN",
        s.description_tr as "descriptionTR",
        s.description_en as "descriptionEN",
        s.details_tr as "detailsTR",
        s.details_en as "detailsEN",
        s.main_image_url as "image",
        s.icon,
        s.order_number as "order_number",
        s.active,
        COALESCE(
          (SELECT json_agg(sg.image_url ORDER BY sg.order_number)
           FROM service_gallery sg
           WHERE sg.service_id = s.id),
          '[]'::json
        ) as "images"
      FROM services s
      WHERE s.active = true
      ORDER BY s.order_number ASC
    `;
    
    const result = await executeQuery(query);
    const services = result.rows;
    
    // Cache önleme başlıkları ile hizmetleri döndür
    return NextResponse.json(
      { success: true, items: services },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Public servis verileri getirilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Servis verileri getirilirken bir hata oluştu' },
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
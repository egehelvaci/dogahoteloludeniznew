import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Oda tipi arayüzü
export interface RoomType {
  id: string;
  nameTR: string;
  nameEN: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Veritabanı sorgu sonucu tipi
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// GET - Tüm oda tiplerini getir
export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        id,
        name_tr as "nameTR",
        name_en as "nameEN",
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM room_types
      ORDER BY name_tr
    `) as QueryResult<RoomType>;

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Oda tipleri alınırken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Oda tipleri alınamadı' },
      { status: 500 }
    );
  }
}

// POST - Yeni oda tipi ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.nameTR || !body.nameEN) {
      return NextResponse.json(
        { success: false, message: 'İsim alanları gereklidir' },
        { status: 400 }
      );
    }

    // UUID oluştur
    const id = uuidv4();

    // Oda tipini ekle
    const result = await executeQuery(`
      INSERT INTO room_types (
        id, 
        name_tr, 
        name_en, 
        active,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, [id, body.nameTR, body.nameEN, body.active !== undefined ? body.active : true]) as QueryResult<{
      id: string;
      name_tr: string;
      name_en: string;
      active: boolean;
      created_at: Date;
      updated_at: Date;
    }>;

    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: result.rows[0].id,
          nameTR: result.rows[0].name_tr,
          nameEN: result.rows[0].name_en,
          active: result.rows[0].active,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        }, 
        message: 'Oda tipi başarıyla eklendi' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Oda tipi eklenirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Oda tipi eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Veri tipleri
interface RoomType {
  id: string;
  nameTR: string;
  nameEN: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RawRoomType {
  id: string;
  name_tr: string;
  name_en: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Veritabanı sorgu sonucu tipi
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// GET - Belirli bir oda tipini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Oda tipi ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    const result = await executeQuery(`
      SELECT 
        id,
        name_tr as "nameTR",
        name_en as "nameEN",
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM room_types
      WHERE id = $1
    `, [id]) as QueryResult<RoomType>;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Oda tipi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Oda tipi alınırken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Oda tipi alınamadı' },
      { status: 500 }
    );
  }
}

// PUT - Oda tipini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Oda tipi ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    // Güncellenecek oda tipinin varlığını kontrol et
    const checkResult = await executeQuery(`
      SELECT id FROM room_types WHERE id = $1
    `, [id]) as QueryResult<{ id: string }>;

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Güncellenecek oda tipi bulunamadı' },
        { status: 404 }
      );
    }

    // Güncellenecek alanları kontrol et
    if (!body.nameTR && !body.nameEN && body.active === undefined) {
      return NextResponse.json(
        { success: false, message: 'Güncellenecek en az bir alan belirtilmelidir' },
        { status: 400 }
      );
    }

    // Mevcut oda tipini al
    const currentResult = await executeQuery(`
      SELECT name_tr, name_en, active FROM room_types WHERE id = $1
    `, [id]) as QueryResult<{
      name_tr: string;
      name_en: string;
      active: boolean;
    }>;

    const currentRoomType = currentResult.rows[0];
    
    // Güncelleme sorgusu
    const updateResult = await executeQuery(`
      UPDATE room_types
      SET 
        name_tr = $1,
        name_en = $2,
        active = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [
      body.nameTR !== undefined ? body.nameTR : currentRoomType.name_tr,
      body.nameEN !== undefined ? body.nameEN : currentRoomType.name_en,
      body.active !== undefined ? body.active : currentRoomType.active,
      id
    ]) as QueryResult<RawRoomType>;

    return NextResponse.json({
      success: true,
      data: {
        id: updateResult.rows[0].id,
        nameTR: updateResult.rows[0].name_tr,
        nameEN: updateResult.rows[0].name_en,
        active: updateResult.rows[0].active,
        createdAt: updateResult.rows[0].created_at,
        updatedAt: updateResult.rows[0].updated_at
      },
      message: 'Oda tipi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Oda tipi güncellenirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Oda tipi güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Oda tipini sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Oda tipi ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    // Silinecek oda tipinin varlığını kontrol et
    const checkResult = await executeQuery(`
      SELECT id FROM room_types WHERE id = $1
    `, [id]) as QueryResult<{ id: string }>;

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Silinecek oda tipi bulunamadı' },
        { status: 404 }
      );
    }

    // Bu oda tipine ait oda var mı kontrol et
    const roomsResult = await executeQuery(`
      SELECT COUNT(*) as count FROM rooms WHERE room_type_id = $1
    `, [id]) as QueryResult<{ count: string }>;

    if (parseInt(roomsResult.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, message: 'Bu oda tipine ait odalar bulunduğu için silinemez' },
        { status: 400 }
      );
    }

    // Oda tipini sil
    await executeQuery(`
      DELETE FROM room_types WHERE id = $1
    `, [id]);

    return NextResponse.json({
      success: true,
      message: 'Oda tipi başarıyla silindi'
    });
  } catch (error) {
    console.error('Oda tipi silinirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Oda tipi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
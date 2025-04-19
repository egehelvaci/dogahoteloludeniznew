import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';

// GET - Belirli bir slider öğesini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Slider ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        id,
        title_tr as "titleTR",
        title_en as "titleEN",
        subtitle_tr as "subtitleTR",
        subtitle_en as "subtitleEN",
        description_tr as "descriptionTR", 
        description_en as "descriptionEN",
        image_url as "image",
        video_url as "videoUrl",
        order_number as "order",
        active
      FROM slider
      WHERE id = $1
    `;
    
    const result = await executeQuery(query, [id]) as any;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Slider öğesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Slider verisi çekme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Slider verisi alınamadı' },
      { status: 500 }
    );
  }
}

// PUT - Slider öğesini güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Slider ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    // Slider varlığını kontrol et
    const checkQuery = `
      SELECT * FROM slider 
      WHERE id = $1
    `;
    
    const checkResult = await executeQuery(checkQuery, [id]) as any;
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Slider öğesi bulunamadı' },
        { status: 404 }
      );
    }

    // Transaction başlat
    const client = await (await executeQuery('BEGIN') as any).client;
    
    try {
      // Slider öğesini güncelle
      const updateQuery = `
        UPDATE slider SET
          title_tr = $1,
          title_en = $2,
          subtitle_tr = $3,
          subtitle_en = $4,
          description_tr = $5,
          description_en = $6,
          image_url = $7,
          video_url = $8,
          order_number = $9,
          active = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;
      
      const updateValues = [
        body.titleTR !== undefined ? body.titleTR : checkResult.rows[0].title_tr,
        body.titleEN !== undefined ? body.titleEN : checkResult.rows[0].title_en,
        body.subtitleTR !== undefined ? body.subtitleTR : checkResult.rows[0].subtitle_tr,
        body.subtitleEN !== undefined ? body.subtitleEN : checkResult.rows[0].subtitle_en,
        body.descriptionTR !== undefined ? body.descriptionTR : checkResult.rows[0].description_tr,
        body.descriptionEN !== undefined ? body.descriptionEN : checkResult.rows[0].description_en,
        body.image !== undefined ? body.image : checkResult.rows[0].image_url,
        body.videoUrl !== undefined ? body.videoUrl : checkResult.rows[0].video_url,
        body.order !== undefined ? body.order : checkResult.rows[0].order_number,
        body.active !== undefined ? body.active : checkResult.rows[0].active,
        id
      ];
      
      const updateResult = await client.query(updateQuery, updateValues);
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      // API yanıtını düzenle - özellik adlarını düzelt
      const updatedSlider = {
        id: updateResult.rows[0].id,
        titleTR: updateResult.rows[0].title_tr,
        titleEN: updateResult.rows[0].title_en,
        subtitleTR: updateResult.rows[0].subtitle_tr,
        subtitleEN: updateResult.rows[0].subtitle_en,
        descriptionTR: updateResult.rows[0].description_tr,
        descriptionEN: updateResult.rows[0].description_en,
        image: updateResult.rows[0].image_url,
        videoUrl: updateResult.rows[0].video_url,
        order: updateResult.rows[0].order_number,
        active: updateResult.rows[0].active
      };
      
      return NextResponse.json({
        success: true,
        data: updatedSlider,
        message: 'Slider öğesi başarıyla güncellendi'
      });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Slider güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Slider güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Slider öğesini sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Slider ID\'si belirtilmedi' },
        { status: 400 }
      );
    }

    // Slider varlığını kontrol et
    const checkQuery = `
      SELECT * FROM slider 
      WHERE id = $1
    `;
    
    const checkResult = await executeQuery(checkQuery, [id]) as any;
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Slider öğesi bulunamadı' },
        { status: 404 }
      );
    }

    // Transaction başlat
    const client = await (await executeQuery('BEGIN') as any).client;
    
    try {
      // Slider öğesini sil
      const deleteQuery = `
        DELETE FROM slider
        WHERE id = $1
        RETURNING *
      `;
      
      const deleteResult = await client.query(deleteQuery, [id]);
      
      // Sıra numaralarını yeniden düzenle
      const reorderQuery = `
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY order_number) as new_order
          FROM slider
        )
        UPDATE slider
        SET order_number = ranked.new_order
        FROM ranked
        WHERE slider.id = ranked.id
      `;
      
      await client.query(reorderQuery);
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      // API yanıtını düzenle
      const deletedSlider = {
        id: deleteResult.rows[0].id,
        titleTR: deleteResult.rows[0].title_tr,
        titleEN: deleteResult.rows[0].title_en,
        image: deleteResult.rows[0].image_url
      };
      
      return NextResponse.json({
        success: true,
        data: deletedSlider,
        message: 'Slider öğesi başarıyla silindi'
      });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Slider silme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Slider silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
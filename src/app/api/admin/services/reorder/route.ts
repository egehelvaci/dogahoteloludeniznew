import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../../lib/db';

// Client arayüzü tanımlaması
interface DbClient {
  query: (query: string, params?: unknown[]) => Promise<unknown>;
  release: () => void;
}

interface ExecuteQueryResult {
  rows?: unknown[];
  rowCount?: number;
  client?: DbClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // items alanının olup olmadığını kontrol et
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Yeniden sıralanacak öğeler dizisi gereklidir' },
        { status: 400 }
      );
    }
    
    // Transaction başlat
    const beginResult = await executeQuery('BEGIN') as ExecuteQueryResult;
    const client = beginResult.client as DbClient;
    
    try {
      // Her bir öğe için sıra numarasını güncelle
      for (const item of body.items) {
        if (!item.id || item.order === undefined) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Her öğenin id ve order alanları olmalıdır' },
            { status: 400 }
          );
        }
        
        const updateQuery = `
          UPDATE services
          SET order_number = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        
        await client.query(updateQuery, [item.order, item.id]);
      }
      
      // Transaction'ı tamamla
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      // Hata durumunda geri al
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Servisler yeniden sıralanırken hata:', error);
    return NextResponse.json(
      { error: 'Servisler yeniden sıralanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

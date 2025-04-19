import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Auth cookie'nin adı
const COOKIE_NAME = 'auth_token';

export async function GET() {
  try {
    const cookieStore = cookies();
    
    // Auth cookie'sini sil
    cookieStore.delete(COOKIE_NAME);
    
    // 200 OK yanıtı ve CORS başlıkları ekle
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Çıkış başarılı' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Logout sırasında hata:', error);
    
    // Hata durumunda bile 200 yanıtı döndür ama hatayı bildir
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Çıkış işlemi sırasında hata oluştu, ancak oturum sonlandırıldı' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// OPTIONS isteği için CORS desteği ekle
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Güvenlik için ortam değişkenlerinden alınması gereken değerler
// Bu değerleri production ortamında .env dosyasına taşıyın
// const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'; // Removed unused variable
const COOKIE_NAME = 'auth_token';

// Kullanıcı kimlik bilgilerini kontrol et
function validateCredentials(username: string, password: string) {
  // Gerçek bir uygulamada, bu bilgiler veritabanından alınmalıdır.
  // Bu örnek için, sabit kullanıcı bilgilerini kullanıyoruz.
  
  // Sabit kullanıcı bilgileri (üretim ortamında asla böyle tutmayın!)
  const ADMIN_USERNAME = 'dogahotel';
  const ADMIN_PASSWORD = 'doga.hotel2025';
  
  // Kullanıcı adını kontrol et
  if (username !== ADMIN_USERNAME) {
    return false;
  }
  
  // Basit şifre karşılaştırması
  return password === ADMIN_PASSWORD;
}

// Basit token oluşturma
function generateToken(username: string) {
  // Bu basit bir simülasyon - gerçek uygulamada JWT kullanılmalıdır
  // Güvenlik açısından, bu basit örnek yerine proper bir JWT kütüphanesi kullanılmalıdır
  
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2);
  
  // Basit bir token formatı oluşturuyoruz
  // Bu güvenli değildir, sadece demo amaçlıdır!
  return `${username}_${timestamp}_${randomValue}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Basit validasyon
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Kullanıcı adı ve şifre gereklidir' 
        }, 
        { status: 400 }
      );
    }
    
    // Kullanıcı bilgilerini kontrol et
    const isValid = validateCredentials(username, password);
    
    if (!isValid) {
      // Güvenlik için, hangi bilginin yanlış olduğunu belirtmeyin
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz kullanıcı adı veya şifre' 
        }, 
        { status: 401 }
      );
    }
    
    // Basit token oluştur
    const token = generateToken(username);

    // Cookie ayarlarını oluştur (await added)
    const cookieStore = await cookies();

    // HttpOnly, Secure ve SameSite özelliklerini açarak güvenliği artır
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Production'da true olmalı
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 saat
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Giriş başarılı' 
    });
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sunucu hatası' 
      }, 
      { status: 500 }
    );
  }
}
// Çıkış yapmak için endpoint
export async function DELETE() {
  // Cookie ayarlarını oluştur (await added)
  const cookieStore = await cookies();

  // Auth cookie'sini sil
  cookieStore.delete(COOKIE_NAME);
  
  return NextResponse.json({ 
    success: true, 
    message: 'Çıkış başarılı' 
  });
}

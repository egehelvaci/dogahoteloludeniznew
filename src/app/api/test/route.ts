import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Veritabanındaki tabloları listele
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // About tablosundan veri getir (varsa)
    const aboutData = await prisma.about.findMany();
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı',
      tables,
      aboutData
    });
  } catch (error) {
    console.error('Veritabanı test hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Veritabanı bağlantı hatası', 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 
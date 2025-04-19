import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Tarayıcıda test etmek için GET metodu
export async function GET() {
  try {
    // About tablosuna örnek bir veri ekle
    const about = await prisma.about.create({
      data: {
        title: 'Hakkımızda',
        content: 'Doğa Hotel, doğayla iç içe bir tatil deneyimi sunar.',
        imageUrl: '/images/about.jpg'
      }
    });

    // Slider tablosuna örnek bir veri ekle
    const slider = await prisma.slider.create({
      data: {
        titleTR: 'Doğa Hotel',
        titleEN: 'Nature Hotel',
        subtitleTR: 'Doğanın içinde huzurlu bir tatil',
        subtitleEN: 'A peaceful holiday in nature',
        descriptionTR: 'En güzel anılarınızı bizimle yaşayın',
        descriptionEN: 'Experience your best memories with us',
        imageUrl: '/images/slider1.jpg',
        orderNumber: 1,
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Örnek veriler başarıyla eklendi',
      data: { about, slider }
    });
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Veri ekleme hatası', 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

// API çağrıları için POST metodu
export async function POST() {
  try {
    // About tablosuna örnek bir veri ekle
    const about = await prisma.about.create({
      data: {
        title: 'Hakkımızda (POST)',
        content: 'Doğa Hotel, doğayla iç içe bir tatil deneyimi sunar.',
        imageUrl: '/images/about.jpg'
      }
    });

    // Slider tablosuna örnek bir veri ekle
    const slider = await prisma.slider.create({
      data: {
        titleTR: 'Doğa Hotel (POST)',
        titleEN: 'Nature Hotel',
        subtitleTR: 'Doğanın içinde huzurlu bir tatil',
        subtitleEN: 'A peaceful holiday in nature',
        descriptionTR: 'En güzel anılarınızı bizimle yaşayın',
        descriptionEN: 'Experience your best memories with us',
        imageUrl: '/images/slider1.jpg',
        orderNumber: 2,
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Örnek veriler başarıyla eklendi (POST)',
      data: { about, slider }
    });
  } catch (error) {
    console.error('Veri ekleme hatası (POST):', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Veri ekleme hatası', 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 
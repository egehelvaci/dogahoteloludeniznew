import { NextRequest, NextResponse } from 'next/server';
import { transformImage } from '../../../lib/imagekit';

export const dynamic = 'force-dynamic';

// Varsayılan thumbnail URL'leri
const DEFAULT_THUMBNAIL_URL = 'https://ik.imagekit.io/dogahotel/placeholders/video-placeholder.jpg';

// YouTube video ID çıkarma fonksiyonu
const getYouTubeVideoId = (url: string): string | null => {
  try {
    if (!url) return null;
    
    let videoId = null;
    
    // youtu.be kısa URL formatı
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    } 
    // youtube.com/watch?v= formatı
    else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } 
    // youtube.com/embed/ formatı
    else if (url.includes('youtube.com/embed/')) {
      const parts = url.split('youtube.com/embed/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    }
    
    // ID temizleme
    if (videoId) {
      // URL parametrelerini ve zaman damgalarını kaldır
      videoId = videoId.split('&')[0].split('#')[0];
    }
    
    return videoId;
  } catch (error) {
    console.error('YouTube video ID çıkarma hatası:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const videoId = searchParams.get('id') || 'video';

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL parametresi gereklidir' },
        { status: 400 }
      );
    }

    // YouTube video kontrol
    const youtubeId = getYouTubeVideoId(videoUrl);
    if (youtubeId) {
      // YouTube video için en yüksek kaliteli thumbnail URL'sini döndür
      // maxresdefault.jpg kullanılır (yoksa otomatik olarak daha düşük çözünürlüğe geçer)
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      return NextResponse.json({ thumbnailUrl });
    }

    // ImageKit video URL'si kontrolü
    if (videoUrl.includes('imagekit.io')) {
      try {
        // Video URL'sinden thumbnail URL'si oluştur
        const thumbnailUrl = transformImage(videoUrl, {
          format: 'jpg',
          quality: 'auto'
        });
        
        return NextResponse.json({ thumbnailUrl });
      } catch (error) {
        console.error('ImageKit thumbnail URL oluşturma hatası:', error);
        return NextResponse.json({ thumbnailUrl: DEFAULT_THUMBNAIL_URL });
      }
    }

    // Diğer video URL'leri için varsayılan thumbnail
    return NextResponse.json({ 
      thumbnailUrl: DEFAULT_THUMBNAIL_URL,
      message: 'Harici video URL\'si için varsayılan thumbnail kullanıldı'
    });
  } catch (error) {
    console.error('Video thumbnail oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Video thumbnail oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 